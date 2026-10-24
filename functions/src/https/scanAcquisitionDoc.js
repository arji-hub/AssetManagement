const { getFirestore } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI, Type } = require("@google/genai");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// Check AI Studio / the pricing page for the current model id before deploying
const MODEL = "gemini-3.5-flash";

const MAX_BASE64_CHARS = 8_000_000;

const nullableString = { type: Type.STRING, nullable: true };

// Must matches
const FALLBACK_CATEGORY_ID = "Others";
const FALLBACK_SUPPLIER = "Bulacan State University - Supply Office";

function buildPrompt(acquisitionType, categories) {
  const docLabel =
    acquisitionType === "donated"
      ? "Deed of Donation"
      : "Property Acknowledgement Receipt (PAR) or Inventory Custodian Slip (ICS)";

  const categoryRule = categories.length
    ? `choose the single best-fitting id from this list, matching on the category name. If nothing fits well, choose the "Others" category. Always choose one (this is the exception to the "use null" rule above):
${JSON.stringify(categories)}`
    : "always null.";

  return `You are reading a photo or scan of a ${docLabel} used by a school's property office.
Extract its contents into the JSON schema.

Rules:
- Use only text that is visible in the document. If a value is not present, use null (or [] for serial_numbers). Never guess or invent values.
- One entry in "items" per line item / table row. Do not merge different items. Do not output totals or subtotal rows.
- qty: the quantity as an integer (1 if not stated).
- unit_value: the per-unit cost as a plain number (no currency symbol, no commas). If only a total amount is shown, use null. ${
    acquisitionType === "donated"
      ? "This is a donation, so always use null."
      : ""
  }
- serial_numbers: only serial numbers printed in the document, exactly as written. Use [] if none.
- description: the item name plus any brand / model / specifications as written, in one string.
- date_acquired: the date of the acquisition or receipt, formatted YYYY-MM-DD.
- donated_by: the donor's name or organization (donation documents only), otherwise null.
- supplier: the supplier / vendor name (purchase documents only). If none is printed, use "Bulacan State University - Supply Office" (this is the exception to the "use null" rule above). For donation documents, use null.
- category_id: ${categoryRule}`;
}

function buildResponseSchema(categoryIds) {
  const hasCategories = categoryIds.length > 0;

  return {
    type: Type.OBJECT,
    properties: {
      acquisition: {
        type: Type.OBJECT,
        properties: {
          date_acquired: { ...nullableString, description: "YYYY-MM-DD" },
          donated_by: nullableString,
          supplier: nullableString,
        },
      },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            qty: { type: Type.INTEGER },
            unit_value: { type: Type.NUMBER, nullable: true },
            serial_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
            category_id: hasCategories
              ? {
                  type: Type.STRING,
                  enum: categoryIds,
                  description:
                    "Best-fitting category id from the provided list",
                }
              : nullableString, // empty enum is invalid, so fall back
            remarks: nullableString,
          },
          required: [
            "description",
            "qty",
            "serial_numbers",
            ...(hasCategories ? ["category_id"] : []),
          ],
        },
      },
    },
    required: ["acquisition", "items"],
  };
}

exports.scanAcquisitionDoc = onCall(
  {
    cors: true,
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 90,
    memory: "512MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const callerDoc = await getFirestore()
      .collection("user")
      .doc(request.auth.uid)
      .get();

    if (!callerDoc.exists || callerDoc.data().role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "Only admins can scan acquisition documents.",
      );
    }

    const { imageBase64, mimeType, acquisitionType, categories } =
      request.data || {};

    if (typeof imageBase64 !== "string" || !imageBase64) {
      throw new HttpsError("invalid-argument", "Missing image.");
    }
    if (imageBase64.length > MAX_BASE64_CHARS) {
      throw new HttpsError("invalid-argument", "Image is too large.");
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      throw new HttpsError("invalid-argument", "Unsupported image type.");
    }

    const safeCategories = Array.isArray(categories)
      ? categories
          .filter(
            (c) => c && typeof c.id === "string" && typeof c.name === "string",
          )
          .map((c) => ({ id: c.id, name: c.name }))
      : [];
    const validIds = new Set(safeCategories.map((c) => c.id));
    const responseSchema = buildResponseSchema([...validIds]);

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              { text: buildPrompt(acquisitionType, safeCategories) },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0,
        },
      });

      const parsed = JSON.parse(response.text);
      // Purchases with no printed supplier default to the supply office.
      // Donations don't use a supplier, so leave it null there.
      if (acquisitionType !== "donated") {
        const supplier = parsed.acquisition.supplier;
        parsed.acquisition.supplier =
          typeof supplier === "string" && supplier.trim()
            ? supplier.trim()
            : FALLBACK_SUPPLIER;
      }
      // Never trust the model for ids: anything not in the list we sent
      // becomes the "Others" fallback category.
      parsed.items = (parsed.items || []).map((item) => ({
        ...item,
        category_id: validIds.has(item.category_id)
          ? item.category_id
          : FALLBACK_CATEGORY_ID,
      }));

      return parsed;
    } catch (err) {
      console.error("scanAcquisitionDoc failed:", err);
      throw new HttpsError("internal", "Could not read the document.");
    }
  },
);
