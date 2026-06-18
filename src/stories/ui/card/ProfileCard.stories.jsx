import ProfileCard from "../../../components/ui/card/ProfileCard";

export default {
  title: "Cards/ProfileCard",
  component: ProfileCard,
  parameters: {
    layout: "centered",
  },
  args: {
    onSave: (formData) => console.log("Save profile:", formData),
  },
};

export const FullTimeCustodian = {
  args: {
    user: {
      firstname: "Juan",
      middlename: "Santos",
      lastname: "Dela Cruz",
      username: "juandelacruz",
      email: "juan.delacruz@example.com",
      role: "fulltime",
    },
  },
};

export const PartTimeCustodian = {
  args: {
    user: {
      firstname: "Maria",
      middlename: "_",
      lastname: "Reyes",
      username: "mariareyes",
      email: "maria.reyes@example.com",
      role: "parttime",
    },
  },
};

export const Admin = {
  args: {
    user: {
      firstname: "Andrea",
      middlename: "Lim",
      lastname: "Santos",
      username: "andreasantos",
      email: "andrea.santos@example.com",
      role: "admin",
    },
  },
};

export const NoMiddleName = {
  args: {
    user: {
      firstname: "Carlo",
      middlename: "_",
      lastname: "Manalo",
      username: "carlomanalo",
      email: "carlo.manalo@example.com",
      role: "fulltime",
    },
  },
};

export const LongName = {
  args: {
    user: {
      firstname: "Maria Theresa",
      middlename: "Bautista Concepcion",
      lastname: "Villanueva-Fernandez",
      username: "mariatheresavillanuevafernandez",
      email: "maria.theresa.villanueva.fernandez@example.com",
      role: "parttime",
    },
  },
};

export const MissingData = {
  args: {
    user: {
      firstname: "",
      middlename: "",
      lastname: "",
      username: "",
      email: "",
      role: "",
    },
  },
};

export const NoUser = {
  args: {
    user: null,
  },
};
