import { additionalUsers, randomUserMock } from "./FE4U-Lab2-mock.js";

// ===== TASK 1 =====

const courseList = [
  "Mathematics", "Physics", "English", "Computer Science", "Dancing",
  "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];

const getRandomCourse = () =>
  courseList[Math.floor(Math.random() * courseList.length)];

const getRandomId = () => {
  const prefix = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const numbers = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${numbers}`;
};

const getRandomColor = () => {
  const chars = "0123456789ABCDEF";
  return "#" + Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * 16)]
  ).join("");
};

function getAllUsers(apiUsers, extraUsers) {
  const rawUsers = [...apiUsers, ...extraUsers].map(normalizeUser);
  const uniqueUsers = deduplicateUsers(rawUsers);
  return uniqueUsers.map(enrichUser);
}

function normalizeUser(u) {
  return {
    gender: String(u.gender ?? ""),
    title: String(u.name?.title ?? u.title ?? ""),
    full_name: String(
      u.full_name ??
      `${u.name?.first ?? u.firstName ?? ""} ${u.name?.last ?? u.lastName ?? ""}`
    ).trim(),
    city: String(u.location?.city ?? u.city ?? ""),
    state: String(u.location?.state ?? u.state ?? ""),
    country: String(u.location?.country ?? u.country ?? ""),
    postcode: String(u.location?.postcode ?? u.postcode ?? ""),
    coordinates: typeof u.location?.coordinates === "object"
      ? u.location.coordinates
      : typeof u.coordinates === "object"
      ? u.coordinates
      : { latitude: "", longitude: "" },
    timezone: typeof u.location?.timezone === "object"
      ? u.location.timezone
      : typeof u.timezone === "object"
      ? u.timezone
      : { offset: "", description: "" },
    email: String(u.email ?? ""),
    b_date: new Date(u.dob?.date ?? u.b_date ?? NaN),
    age: Number(u.dob?.age ?? u.age ?? NaN),
    phone: String(u.phone ?? ""),
    picture_large: String(u.picture?.large ?? u.picture_large ?? ""),
    picture_thumbnail: String(u.picture?.thumbnail ?? u.picture_thumbnail ?? "")
  };
}

function deduplicateUsers(users) {
  const seen = new Map();

  users.forEach(u => {
    const key = u.full_name.toLowerCase();
    const existing = seen.get(key);

    if (existing) {
      const merged = { ...existing };
      for (const field in u) {
        const val = u[field];
        if (val !== undefined && val !== null && val !== "") {
          merged[field] = val;
        }
      }
      seen.set(key, merged);
    } else {
      seen.set(key, u);
    }
  });

  return [...seen.values()];
}

function enrichUser(u) {
  return {
    ...u,
    id: String(u.id ?? getRandomId()),
    favorite: Boolean(u.favorite),
    course: String(u.course ?? getRandomCourse()),
    bg_color: String(u.bg_color ?? getRandomColor()),
    note: String(u.note ?? "")
  };
}


// ===== TASK 2 =====

const COUNTRY_NUM = {
  "Ukraine": "+380", "Germany": "+49", "Ireland": "+353", "Australia": "+61",
  "United States": "+1", "Finland": "+358", "Turkey": "+90", "Switzerland": "+41",
  "New Zealand": "+64", "Spain": "+34", "Norway": "+47", "Denmark": "+45",
  "Iran": "+98", "Canada": "+1", "France": "+33", "Netherlands": "+31",
  "United Kingdom": "+44", "Poland": "+48"
};

const PHONE_BY_COUNTRY = {
  "Ukraine": /^\+?380\d{9}$/, "Germany": /^\+?49\d{7,14}$/, "Ireland": /^\+?353\d{7,9}$/,
  "Australia": /^\+?61\d{8,9}$/, "United States": /^\+?1\d{10}$/, "Canada": /^\+?1\d{10}$/,
  "United Kingdom": /^\+?44\d{9,10}$/, "France": /^\+?33\d{8,9}$/, "Poland": /^\+?48\d{9}$/,
  "Netherlands": /^\+?31\d{8,9}$/, "Finland": /^\+?358\d{6,10}$/, "Turkey": /^\+?90\d{10}$/,
  "Switzerland": /^\+?41\d{9}$/, "New Zealand": /^\+?64\d{8,9}$/, "Spain": /^\+?34\d{9}$/,
  "Norway": /^\+?47\d{8}$/, "Denmark": /^\+?45\d{8}$/, "Iran": /^\+?98\d{9,10}$/
};


function validateUsers(users) {
  return users.map(u => normalizeUserFields(u)).map(validateUser).filter(u => u.valid);
}

function normalizeUserFields(user) {
  const normalized = { ...user };

  if (typeof normalized.gender === "string") {
    const g = normalized.gender.trim();
    normalized.gender = g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : "";
  }

  if (typeof normalized.note === "string") {
    const n = normalized.note.trim();
    normalized.note = n ? n.charAt(0).toUpperCase() + n.slice(1) : "";
  }

  if (typeof normalized.phone === "string") {
    let digits = normalized.phone.replace(/\D/g, "");
    const prefix = COUNTRY_NUM[normalized.country];
    if (prefix) {
      if (digits.startsWith("0")) digits = digits.slice(1);
      normalized.phone = prefix + digits;
    } else {
      normalized.phone = "+" + digits;
    }
  }

  return normalized;
}

function validateUser(user) {
  const errors = [];

  const checkCapital = (val, label) => {
    if (typeof val !== "string" || !/^\p{Lu}/u.test(val.trim())) {
      errors.push(`${label} повинно бути рядком і починатися з великої літери.`);
    }
  };

  const checkGender = val => {
    if (typeof val !== "string") {
      errors.push("Gender повинно бути рядком.");
    }
  };

  const checkAge = val => {
    if (typeof val !== "number" || !Number.isFinite(val)) {
      errors.push("Вік повинен бути валідним числом.");
    }
  };

  const checkEmail = val => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      errors.push("Email має бути у форматі example@example.com.");
    }
  };

  const checkPhone = (country, phone) => {
    const pattern = PHONE_BY_COUNTRY[country];
    if (!pattern || !pattern.test(phone)) {
      errors.push(`Номер телефону не відповідає формату країни: ${country}.`);
    }
  };

  checkCapital(user.full_name, "Full name");
  checkCapital(user.state, "State");
  checkCapital(user.city, "City");
  checkCapital(user.country, "Country");
  checkGender(user.gender);
  checkAge(user.age);
  checkEmail(user.email);
  checkPhone(user.country, user.phone);

  if (typeof user.note !== "string") {
    errors.push("Note повинна бути рядком.");
  } else if (user.note.trim() !== "") {
    checkCapital(user.note, "Note");
  }

  return {
    ...user,
    valid: errors.length === 0,
    errors
  };
}

// ===== TASK 3 =====

function filterUsers(users, filters) {
  return users.filter(u =>
    (filters.country ? u.country === filters.country : true) &&
    (filters.ageMin !== undefined ? u.age >= filters.ageMin : true) &&
    (filters.ageMax !== undefined ? u.age <= filters.ageMax : true) &&
    (filters.gender ? u.gender === filters.gender : true) &&
    (filters.favorite !== undefined ? u.favorite === filters.favorite : true)
  );
}

const filters1 = { country: "Germany", ageMin: 30, ageMax: 70, gender: "male", favorite: true };
const filters2 = { ageMin: 70, ageMax: 60 };
const filters3 = { country: "France" };

// ===== TASK 4 =====

function sortUsers(users, sortBy, ascending = true) {
  return [...users].sort((a, b) => {
    let cmp = 0;
    if (typeof a[sortBy] === "string") cmp = a[sortBy].localeCompare(b[sortBy]);
    else if (typeof a[sortBy] === "number") cmp = a[sortBy] - b[sortBy];
    return ascending ? cmp : -cmp;
  });
}

// ===== TASK 5 =====

function findUsers(users, searchQuery) {
  if (!searchQuery) return [];

  const terms = String(searchQuery).split("+").map(t => t.trim().toLowerCase());

  return users.filter(user => {
    return terms.every(term => {
      if (/^[><=]\d+$/.test(term)) {
        const op = term[0];
        const val = parseInt(term.slice(1), 10);
        if (op === ">") return user.age > val;
        if (op === "<") return user.age < val;
        if (op === "=") return user.age === val;
        return false;
      }
      return Object.values(user).some(value => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(term);
        }
        if (typeof value === "number") {
          return value.toString().includes(term);
        }
        return false;
      });
    });
  });
}


// ===== TASK 6 =====

const getMatchingPercentage = (users, searchParam) =>
  ((findUsers(users, searchParam).length / users.length) * 100).toFixed(2);

// ===== EXECUTION =====

const mergedUsers = getAllUsers(randomUserMock, additionalUsers);
const validatedUsers = validateUsers(mergedUsers);

const filteredUsers1 = filterUsers(validatedUsers, filters3);
const sortedByName = sortUsers(validatedUsers, "full_name", false);
const sortedByAgeDesc = sortUsers(validatedUsers, "age", false);
const sortedByCountryDesc = sortUsers(validatedUsers, "country", false);
const findUsers1 = findUsers(mergedUsers, "Norb+Germany+526");
const percentageByName = getMatchingPercentage(validatedUsers, "no");

console.log(findUsers1);