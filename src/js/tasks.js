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

function mergeUsers(apiUsers, extraUsers) {
  const merged = apiUsers.map(u => {
    const match = extraUsers.find(eu =>
      eu.full_name === `${u.name.first} ${u.name.last}` && eu.email === u.email
    );

    return {
      gender: u.gender,
      title: u.name.title,
      full_name: `${u.name.first} ${u.name.last}`,
      city: u.location.city,
      state: u.location.state,
      country: u.location.country,
      postcode: u.location.postcode,
      coordinates: u.location.coordinates,
      timezone: u.location.timezone,
      email: u.email,
      b_date: u.dob.date,
      age: u.dob.age,
      phone: u.phone,
      picture_large: u.picture.large,
      picture_thumbnail: u.picture.thumbnail,
      id: match?.id || getRandomId(),
      favorite: match?.favorite ?? false,
      course: match?.course || getRandomCourse(),
      bg_color: match?.bg_color || getRandomColor(),
      note: match?.note || "Note about user"
    };
  });

  extraUsers.forEach(eu => {
    const exists = merged.some(mu =>
      mu.full_name === eu.full_name && mu.email === eu.email
    );
    if (!exists) merged.push(eu);
  });

  return merged;
}

// ===== TASK 2 =====

function validateUser(user) {
  const errors = [];

  const validateStringField = (val, label) => {
    if (typeof val !== "string" || val[0] !== val[0]?.toUpperCase()) {
      errors.push(`${label} повинно бути рядком і починатися з великої літери.`);
    }
  };

  const validateGender = (val, label) => {
    if (typeof val !== "string") {
      errors.push(`${label} повинно бути рядком.`);
    }
  };

  const validateAge = age => {
    if (typeof age !== "number") {
      errors.push("Вік повинен бути числом.");
    }
  };

  const validateAndFormatPhone = phone => {
    const raw = phone ? String(phone) : "";
    const formatted = raw.replace(/[\s\-()]/g, "");
    const phoneRegex = /^\+?\d+$/;

    if (!phone) {
      errors.push("Номер телефону відсутній.");
    } else {
      if (!phoneRegex.test(formatted)) {
        errors.push(`Номер телефону ${phone} повинен містити тільки цифри і може починатися з +.`);
      }
      if (formatted.length < 8 || formatted.length > 16) {
        errors.push(`Номер телефону ${phone} повинен містити від 10 до 15 цифр.`);
      }
    }
    return formatted;
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Email має бути у форматі example@example.com.");
    }
  };

  validateStringField(user.full_name, "Full name");
  validateGender(user.gender, "Gender");
  validateStringField(user.state, "State");
  validateStringField(user.city, "City");
  validateStringField(user.country, "Country");

  validateAge(user.age);
  validateEmail(user.email);
  user.phone = validateAndFormatPhone(user.phone);

  return { valid: errors.length === 0, errors };
}

const validateAllUsers = users =>
  users.map((u, idx) => {
    const res = validateUser(u);
    return {
      userIndex: idx,
      valid: res.valid,
      errors: res.errors,
      message: res.valid ? "Valid" : "Invalid"
    };
  });

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

const mergedUsers = mergeUsers(randomUserMock, additionalUsers);
const validationResults = validateAllUsers(mergedUsers);
const validatedUsers = mergedUsers.filter((_, i) => validationResults[i].valid);

const filteredUsers1 = filterUsers(validatedUsers, filters3);
const sortedByName = sortUsers(validatedUsers, "full_name", true);
const sortedByAgeDesc = sortUsers(validatedUsers, "age", false);
const sortedByBday = sortUsers(validatedUsers, "b_date", true);
const sortedByCountryDesc = sortUsers(validatedUsers, "country", false);
const findUsers1 = findUsers(validatedUsers, "Norb+Germany+526");
const percentageByName = getMatchingPercentage(validatedUsers, "n");

console.log(validatedUsers);