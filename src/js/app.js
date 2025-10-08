import { additionalUsers, randomUserMock } from "./FE4U-Lab2-mock.js";

//LAB 2
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
  let b_date;
  try {
    b_date = new Date(u.dob?.date ?? u.b_date ?? NaN);
    // If it's an invalid date, use age to estimate birth year
    if (isNaN(b_date.getTime())) {
      const currentYear = new Date().getFullYear();
      b_date = new Date(currentYear - (u.dob?.age ?? u.age ?? 30), 0, 1);
    }
  } catch (error) {
    const currentYear = new Date().getFullYear();
    b_date = new Date(currentYear - (u.dob?.age ?? u.age ?? 30), 0, 1);
  }

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
    b_date: b_date,
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
    normalized.gender = g ? g.toLowerCase() : "";
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
      errors.push(`${label} has to be a string and start with a capital letter.`);
    }
  };

  const checkGender = val => {
    if (typeof val !== "string") {
      errors.push("Gender has to be a string.");
    }
  };

  const checkAge = val => {
    if (typeof val !== "number" || !Number.isFinite(val)) {
      errors.push("Age has to be a valid number.");
    }
  };

  const checkEmail = val => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      errors.push("Email has to be in such format: example@example.com.");
    }
  };

  const checkPhone = (country, phone) => {
    const pattern = PHONE_BY_COUNTRY[country];
    if (!pattern || !pattern.test(phone)) {
      errors.push(`Phone number has to correspond to the country: ${country}.`);
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
    errors.push("Note has to be a string.");
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

function sortUsers(teachers, sortBy, direction) {
    return [...teachers].sort((a, b) => {
        let cmp = 0;
        
        // Handle NaN values - they should always be at the end
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        const aIsInvalid = aVal === undefined || aVal === null || 
                          (typeof aVal === 'number' && isNaN(aVal)) ||
                          (aVal instanceof Date && isNaN(aVal.getTime()));
        const bIsInvalid = bVal === undefined || bVal === null || 
                          (typeof bVal === 'number' && isNaN(bVal)) ||
                          (bVal instanceof Date && isNaN(bVal.getTime()));
        
        // If both are invalid, they are equal
        if (aIsInvalid && bIsInvalid) {
            cmp = 0;
        }
        else if (aIsInvalid) {
            cmp = 1;
        }
        else if (bIsInvalid) {
            cmp = -1;
        }
        else if (sortBy === 'b_date') {
            const dateA = aVal instanceof Date ? aVal : new Date(aVal);
            const dateB = bVal instanceof Date ? bVal : new Date(bVal);
            cmp = dateA.getTime() - dateB.getTime();
        } 
        else if (typeof aVal === 'string') {
            cmp = aVal.localeCompare(bVal);
        } 
        else if (typeof aVal === 'number') {
            cmp = aVal - bVal;
        }
        
        return direction === 'asc' ? cmp : -cmp;
    });
}

// ===== TASK 5 =====

function findUsers(users, searchQuery) {
  if (!searchQuery) return [];

  const terms = String(searchQuery).replace(/\s\s+/g, ' ').split("+").map(t => t.trim().toLowerCase());

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
      
      return (
        (typeof user.full_name === "string" && user.full_name.toLowerCase().includes(term)) ||
        (typeof user.note === "string" && user.note.toLowerCase().includes(term))
      );
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
const sortedByAgeDesc = sortUsers(validatedUsers, "b_day", false);
const sortedByCountryDesc = sortUsers(validatedUsers, "country", false);
const findUsers1 = findUsers(mergedUsers, "Norb+Germany+526");
const percentageByName = getMatchingPercentage(validatedUsers, "no");

//LAB 3


class TeacherManager {
  constructor() {
    this.teachers = [];
    this.filteredTeachers = [];
    this.favorites = new Set();
    this._isInitialized = false;
    this.currentFilters = {};
    this.currentSort = { field: null, direction: null };
  }

  async init() {
    try {
      await this.loadTeacherData();
      this.setupFilterOptions();
      this.applyFilters();
      this.displayFavorites();
      this.displayStatistics();
      this.setupEventListeners();
      this.setupSearchListener();
      this._isInitialized = true;
      console.log('TeacherManager initialized successfully with', this.teachers.length, 'teachers');
    } catch (error) {
      console.error('Failed to initialize TeacherManager:', error);
    }
  }

  // ===== TASK 1: Display teachers with favorites functionality =====
  displayTeachers() {
    const grid = document.querySelector('.teachers-grid');
    if (!grid) {
      console.error('Teachers grid not found');
      return;
    }

    console.log('Displaying teachers - Total:', this.teachers.length, 'Filtered:', this.filteredTeachers.length);
    console.log('Filtered teachers:', this.filteredTeachers);

    grid.innerHTML = '';

    if (this.filteredTeachers.length === 0) {
      let message = 'No teachers found matching your criteria.';
      if (this.currentSearchQuery) {
        message = `No teachers found for "${this.currentSearchQuery}". Try different search terms.`;
      }
      grid.innerHTML = `<p class="no-teachers">${message}</p>`;
      return;
    }

    this.filteredTeachers.forEach(teacher => {
      const card = this.createTeacherCard(teacher);
      grid.appendChild(card);
    });
  }

  displayFavorites() {
    const favoritesContainer = document.querySelector('.favorites-carousel');
    if (!favoritesContainer) {
      console.error('Favorites container not found');
      return;
    }

    const favoriteTeachers = Array.from(this.favorites)
      .map(teacherId => this.teachers.find(teacher => teacher.id === teacherId))
      .filter(teacher => teacher);

    console.log('Displaying favorites:', favoriteTeachers.length);

    if (favoriteTeachers.length === 0) {
      favoritesContainer.innerHTML = '<p class="no-favorites">No favorite teachers yet. Click the star to add some!</p>';
      return;
    }

    favoritesContainer.innerHTML = '';
    favoriteTeachers.forEach(teacher => {
      const card = this.createTeacherCard(teacher);
      favoritesContainer.appendChild(card);
    });
  }

  createTeacherCard(teacher) {
    const card = document.createElement('div');
    card.className = 'teacher-card';
    card.setAttribute('data-id', teacher.id);
    card.innerHTML = this.getTeacherCardHTML(teacher);
    return card;
  }

  getTeacherCardHTML(teacher) {
    const isFavorite = this.favorites.has(teacher.id);

    const photo = teacher.picture_thumbnail || teacher.picture_medium || teacher.picture_large;
    const avatarContent = photo
      ? `<img src="${photo}" alt="${teacher.full_name}" onerror="this.style.display='none'">`
      : `<div class="teacher-initials">${this.getInitials(teacher.full_name)}</div>`;

    return `
      <div class="teacher-info">
        <div class="teacher-avatar">
          ${avatarContent}
        </div>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${teacher.id}" 
                  title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">★</button>
        <h3>
          <p class="teacher-name">${this.getFirstName(teacher.full_name)}</p>
          <p class="teacher-surname">${this.getLastName(teacher.full_name)}</p>
        </h3>
        <p class="teacher-specialty">${teacher.course}</p>
        <p class="teacher-country">${teacher.country}</p>
      </div>
    `;
  }
  showTeacherPopup(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay active';
    popupOverlay.innerHTML = this.getTeacherPopupHTML(teacher);
    
    document.body.appendChild(popupOverlay);
    document.body.classList.add('popup-open');

    this.setupPopupEventListeners(popupOverlay, teacher);
  }

  getTeacherPopupHTML(teacher) {
    const isFavorite = this.favorites.has(teacher.id);
    const starIcon = isFavorite ? '★' : '☆';

    const hasPicture = teacher.picture_large || teacher.picture_medium || teacher.picture_thumbnail;
    const initials = this.getInitials(teacher.full_name);

    const avatarHTML = hasPicture
      ? `<img src="${teacher.picture_large || teacher.picture_thumbnail}" alt="${teacher.full_name}" />`
      : `<div class="teacher-initials" title="${teacher.full_name}">${initials}</div>`;

    return `
      <section class="teacher-profile">
        <div class="popup-title">
          <h1>Teacher Info</h1>
          <span class="close-btn" title="Close popup">×</span>
        </div>
        <div class="teacher-avatar">
          ${avatarHTML}
        </div>
        <header>
          <h2>${teacher.full_name}</h2>
          <span class="favourite" title="${isFavorite ? 'Remove from favourites' : 'Add to favourites'}">${starIcon}</span>
        </header>
        <p class="subject">${teacher.course}</p>
        <p class="location">${teacher.city || 'Unknown'}, ${teacher.country}</p>
        <p class="age-gender">${teacher.age}, ${teacher.gender}</p>
        <a href="mailto:${teacher.email}" class="email">${teacher.email}</a>
        <p class="telephone">${teacher.phone}</p>
        <p class="bio">${teacher.note || 'No additional information available.'}</p>
        <button class="back-button toggle-map">Toggle Map</button>
      </section>
    `;
  }

  setupPopupEventListeners(popupOverlay, teacher) {
    const closeBtn = popupOverlay.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => this.closeTeacherPopup(popupOverlay));

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        this.closeTeacherPopup(popupOverlay);
      }
    });

    const popupFavorite = popupOverlay.querySelector('.favourite');
    popupFavorite.addEventListener('click', () => {
      this.toggleFavorite(teacher.id);
      const isFavorite = this.favorites.has(teacher.id);
      popupFavorite.textContent = isFavorite ? '★' : '☆';
      popupFavorite.title = isFavorite ? 'Remove from favourites' : 'Add to favourites';
      this.applyFilters();
      const mainFavoriteBtn = document.querySelector(`.favorite-btn[data-id="${teacher.id}"]`);
      if (mainFavoriteBtn) {
        mainFavoriteBtn.classList.toggle('active', isFavorite);
        mainFavoriteBtn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
      }
    });

    const toggleMapBtn = popupOverlay.querySelector('.toggle-map');
    toggleMapBtn.addEventListener('click', () => {
      this.closeTeacherPopup(popupOverlay);
    });

    const closeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeTeacherPopup(popupOverlay);
        document.removeEventListener('keydown', closeHandler);
      }
    };
    document.addEventListener('keydown', closeHandler);
  }

  closeTeacherPopup(popupOverlay) {
    if (popupOverlay) {
      popupOverlay.remove();
    }
    document.body.classList.remove('popup-open');
  }

  toggleFavorite(teacherId, button = null) {
    const isFavorite = this.favorites.has(teacherId);
    if (isFavorite) {
      this.favorites.delete(teacherId);
      if (button) {
        button.classList.remove('active');
        button.title = 'Add to favorites';
      }
    } else {
      this.favorites.add(teacherId);
      if (button) {
        button.classList.add('active');
        button.title = 'Remove from favorites';
      }
    }
    if (button) {
      button.classList.toggle('active', !isFavorite);
      button.title = isFavorite ? 'Add to favorites' : 'Remove from favorites';
    }

  const popupStar = document.querySelector('.teacher-profile .favourite');
  if (popupStar && popupStar.closest(`[data-id="${teacherId}"]`)) {
    popupStar.textContent = isFavorite ? '☆' : '★';
  }

    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    teacher.favorite = !teacher.favorite;

    this.updateFavoritesDOM(teacher, !isFavorite);
    this.applyFilters();
  }

  updateFavoritesDOM(teacher, added) {
    const favoritesContainer = document.querySelector('.favorites-carousel');
    if (!favoritesContainer) return;

    if (added) {
      const msg = favoritesContainer.querySelector('.no-favorites');
      if (msg) favoritesContainer.innerHTML = '';
      favoritesContainer.appendChild(this.createTeacherCard(teacher));
    } else {
      const card = favoritesContainer.querySelector(`[data-id="${teacher.id}"]`);
      if (card) card.remove();

      if (favoritesContainer.children.length === 0) {
        favoritesContainer.innerHTML = '<p class="no-favorites">No favorite teachers yet. Click the star to add some!</p>';
      }
    }
  }

  // ===== TASK 2: Filtering functionality =====
  setupFilterOptions() {
    const countries = [...new Set(this.teachers.map(teacher => teacher.country))].sort();
    const countryFilter = document.getElementById('region-filter');
    
    if (countryFilter) {
      countryFilter.innerHTML = '<option value="">All Countries</option>';
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
      });
    }

    const genderFilter = document.getElementById('gender-filter');
    if (genderFilter) {
      genderFilter.innerHTML = `
        <option value="">All Genders</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      `;
    }
  }

  applyFilters() {
    console.log('Applying filters...');
    
    const ageFilter = document.getElementById('age-filter');
    const countryFilter = document.getElementById('region-filter');
    const genderFilter = document.getElementById('gender-filter');
    const photoFilter = document.getElementById('photo-only');
    const favoritesFilter = document.getElementById('favorites-only');

    const filters = {};

    if (ageFilter && ageFilter.value) {
      const ageRange = ageFilter.value;
      console.log('Age filter:', ageRange);
      
      if (ageRange === '18-31') {
        filters.ageMin = 18;
        filters.ageMax = 31;
      } else if (ageRange === '32-45') {
        filters.ageMin = 32;
        filters.ageMax = 45;
      } else if (ageRange === '46+') {
        filters.ageMin = 46;
      }
    }

    if (countryFilter && countryFilter.value) {
      filters.country = countryFilter.value;
      console.log('Country filter:', filters.country);
    }

    if (genderFilter && genderFilter.value) {
      filters.gender = genderFilter.value;
      console.log('Gender filter:', filters.gender);
    }

    if (favoritesFilter && favoritesFilter.checked) {
      filters.favorite = true;
      console.log('Favorites filter: true');
    }

    this.currentFilters = filters;

    if (this.currentSearchQuery) {
      this.applySearchWithFilters(this.currentSearchQuery);
    } else {
      let filteredTeachers = this.teachers;

      if (Object.keys(filters).length > 0) {
        filteredTeachers = filterUsers(this.teachers, filters);
      }

      if (photoFilter && photoFilter.checked) {
        filteredTeachers = filteredTeachers.filter(teacher => {
          const hasPhoto = teacher.picture_thumbnail || teacher.picture_medium || teacher.picture_large;
          return hasPhoto && hasPhoto !== '';
        });
      }

      this.filteredTeachers = filteredTeachers;
      this.displayTeachers();
      this.displayStatistics();
    }
  }

  applySearchWithFilters(searchQuery) {
    let results = findUsers(this.teachers, searchQuery);
    
    if (Object.keys(this.currentFilters).length > 0) {
      results = filterUsers(results, this.currentFilters);
    }

    const photoFilter = document.getElementById('photo-only');
    if (photoFilter && photoFilter.checked) {
      results = results.filter(teacher => {
        const hasPhoto = teacher.picture_thumbnail || teacher.picture_medium || teacher.picture_large;
        return hasPhoto && hasPhoto !== '';
      });
    }

    this.filteredTeachers = results;
    this.displayTeachers();
    this.displayStatistics();
  }

  // ===== TASK 3: Sorting functionality =====
  displayStatistics() {
  const tbody = document.querySelector('.stats-table tbody');
  if (!tbody) {
    console.error('Statistics table body not found');
    return;
  }

  tbody.innerHTML = '';

  const teachersToDisplay = Array.isArray(this.filteredTeachers) ? this.filteredTeachers : [];

  if (teachersToDisplay.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'No teacher data available';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  const fragment = document.createDocumentFragment();

  teachersToDisplay.forEach(teacher => {
    const row = document.createElement('tr');

    const birthDate = (teacher.b_date instanceof Date && !isNaN(teacher.b_date.getTime()))
      ? teacher.b_date.toLocaleDateString()
      : 'Unknown';

    const cells = [
      { field: 'full_name', value: teacher.full_name || '' },
      { field: 'course', value: teacher.course || '' },
      { field: 'age', value: teacher.age != null ? String(teacher.age) : '' },
      { field: 'gender', value: teacher.gender || '' },
      { field: 'country', value: teacher.country || '' },
      { field: 'b_date', value: birthDate }
    ];

    cells.forEach(c => {
      const td = document.createElement('td');
      td.dataset.field = c.field;
      td.textContent = c.value;
      row.appendChild(td);
    });

    fragment.appendChild(row);
  });

  tbody.appendChild(fragment);

  this.setupTableSorting();
}


setupTableSorting() {
  if (this._sortingInitialized) return;
  this._sortingInitialized = true;

  const table = document.querySelector('.stats-table');
  if (!table) return;

  table.querySelectorAll('th').forEach(h => {
    h.classList.add('sortable');
    h.style.cursor = 'pointer';
    h.setAttribute('role', 'button');
  });

  table.addEventListener('click', (e) => {
    const th = e.target.closest('th');
    if (!th) return;
    this.handleTableSort(th);
  });
}

  handleTableSort(header) {
    const sortField = header.dataset.field;
    console.log('Sorting by field:', sortField);
    
    if (!sortField) return;

    if (this.currentSort.field !== sortField) {
      this.currentSort = { field: sortField, direction: 'asc' };
    } else {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    const sortedTeachers = sortUsers(this.filteredTeachers, sortField, this.currentSort.direction);
    this.updateStatisticsTable(sortedTeachers);
    this.updateSortIndicators(header);
  }

  updateStatisticsTable(sortedTeachers) {
    const tbody = document.querySelector('.stats-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    sortedTeachers.forEach(teacher => {
      const row = document.createElement('tr');
      const birthDate = teacher.b_date instanceof Date && !isNaN(teacher.b_date.getTime()) 
        ? teacher.b_date.toLocaleDateString() 
        : 'Unknown';
      
      row.innerHTML = `
        <td data-field="full_name">${teacher.full_name}</td>
        <td data-field="course">${teacher.course}</td>
        <td data-field="age">${teacher.age}</td>
        <td data-field="gender">${teacher.gender}</td>
        <td data-field="country">${teacher.country}</td>
        <td data-field="b_date">${birthDate}</td>
      `;
      tbody.appendChild(row);
    });
  }

  updateSortIndicators(clickedHeader) {
    const allHeaders = document.querySelectorAll('.stats-table th');
    allHeaders.forEach(header => {
      header.classList.remove('sorted-asc', 'sorted-desc');
      header.style.backgroundColor = '';
    });

    if (!this.currentSort.field || !this.currentSort.direction) {
      return;
    }
    
    clickedHeader.classList.add(this.currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
  }

  // ===== TASK 4: Search functionality =====
  setupSearchListener() {
  const searchInput = document.getElementById('search-line');
  if (!searchInput) return;

  let debounceTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const query = searchInput.value.trim();
      this.currentSearchQuery = query || null;
      if (query === '') {
        this.applyFilters();
      } else {
        this.applySearchWithFilters(query);
      }
    }, 250);
  });
}

  
  performSearch() {
    const searchInput = document.getElementById('search-line');
    if (!searchInput) return;

    const searchQuery = searchInput.value.trim();
    this.currentSearchQuery = searchQuery;

    if (searchQuery === '') {
      this.currentSearchQuery = null;
      this.applyFilters();
      return;
    }

    this.applySearchWithFilters(searchQuery);
  }

  // ===== TASK 5: Add teacher functionality =====
  showAddTeacherPopup() {
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay active';
    popupOverlay.innerHTML = this.getAddTeacherPopupHTML();
    
    document.body.appendChild(popupOverlay);
    document.body.classList.add('popup-open');

    this.setupAddTeacherFormListeners(popupOverlay);
  }

  getAddTeacherPopupHTML() {
    return `
      <section class="teacher-form">
        <div class="popup-title">
          <h1>Add Teacher</h1>
          <span class="close-btn" title="Close popup">×</span>
        </div>

        <form id="add-teacher-form" action="#" method="post">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" placeholder="Enter name" required />

          <label for="specialty">Specialty</label>
          <select id="specialty" name="specialty" required>
            <option value="">Select a specialty</option>
            ${courseList.map(course => `<option value="${course}">${course}</option>`).join('')}
          </select>

          <div class="form-grid">
            <div>
              <label for="country">Country</label>
              <select id="country" name="country" required>
                <option value="">Select a country</option>
                ${[...new Set(this.teachers.map(t => t.country))].sort().map(country => 
                  `<option value="${country}">${country}</option>`
                ).join('')}
              </select>

              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="email@example.com" required />

              <label for="dob">Date of Birth</label>
              <input type="date" id="dob" name="dob" required />

              <div class="info-group">
                <label class="group-label">Gender</label>
                <div class="radio-group">
                  <label><input type="radio" name="gender" value="male" required /> Male</label>
                  <label><input type="radio" name="gender" value="female" /> Female</label>
                </div>
              </div>

              <div class="info-group">
                <label for="bg-color">Background color</label>
                <input type="color" id="bg-color" name="bg-color" value="${getRandomColor()}" required />
              </div>
            </div>

            <div>
              <label for="city">City</label>
              <input type="text" id="city" name="city" placeholder="Enter city" required />

              <label for="phone">Phone</label>
              <input type="tel" id="phone" name="phone" placeholder="+1234567890" required />

              <label for="state">State</label>
              <input type="text" id="state" name="state" placeholder="Enter state" />

              <label for="postcode">Postcode</label>
              <input type="text" id="postcode" name="postcode" placeholder="Enter postcode" />
            </div>
          </div>

          <label for="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows="3" placeholder="Additional information about the teacher"></textarea>

          <button type="submit" class="submit-btn">Add Teacher</button>
        </form>
      </section>
    `;
  }

  setupAddTeacherFormListeners(popupOverlay) {
    const form = popupOverlay.querySelector('#add-teacher-form');
    const closeBtn = popupOverlay.querySelector('.close-btn');

    closeBtn.addEventListener('click', () => this.closeAddTeacherPopup(popupOverlay));

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        this.closeAddTeacherPopup(popupOverlay);
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTeacherFormSubmit(form, popupOverlay);
    });

    const closeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeAddTeacherPopup(popupOverlay);
        document.removeEventListener('keydown', closeHandler);
      }
    };
    document.addEventListener('keydown', closeHandler);
  }

  handleAddTeacherFormSubmit(form, popupOverlay) {
    const formData = new FormData(form);
    const newTeacher = this.collectFormData(formData);

    const normalizedTeacher = normalizeUserFields(newTeacher);
    const validation = validateUser(normalizedTeacher);
    
    if (validation.valid) {
      this.addNewTeacher(validation);
      this.closeAddTeacherPopup(popupOverlay);
    } else {
      this.showValidationErrors(validation.errors);
    }
  }

  collectFormData(formData) {
    const dob = new Date(formData.get('dob'));
    const age = new Date().getFullYear() - dob.getFullYear();

    return {
      gender: formData.get('gender'),
      title: '',
      full_name: formData.get('name').trim(),
      city: formData.get('city').trim(),
      state: formData.get('state').trim(),
      country: formData.get('country'),
      postcode: formData.get('postcode').trim(),
      coordinates: { latitude: '', longitude: '' },
      timezone: { offset: '', description: '' },
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      b_date: dob,
      age: age,
      picture_large: '',
      picture_thumbnail: '',
      course: formData.get('specialty'),
      bg_color: formData.get('bg-color'),
      note: formData.get('notes') || '',
      favorite: false
    };
  }

  addNewTeacher(validatedTeacher) {
    const { valid, errors, ...teacherData } = validatedTeacher;
    const enrichedTeacher = enrichUser(teacherData);
    this.teachers.unshift(enrichedTeacher);
    this.applyFilters();
    console.log('New teacher added:', enrichedTeacher);
  }

  closeAddTeacherPopup(popupOverlay) {
    if (popupOverlay) {
      popupOverlay.remove();
    }
    document.body.classList.remove('popup-open');
  }

  showValidationErrors(errors) {
    const errorMessage = errors.join('\n• ');
    alert(`Please fix the following errors:\n\n• ${errorMessage}`);
  }

  // ===== UTILITY METHODS =====
  getInitials(fullName) {
    return fullName.split(' ').map(name => name[0]).join('.').toUpperCase() + '.';
  }

  getFirstName(fullName) {
    return fullName.split(' ')[0];
  }

  getLastName(fullName) {
    const parts = fullName.split(' ');
    return parts.slice(1).join(' ');
  }

  scrollCarousel(direction) {
    const carousel = document.querySelector('.favorites-carousel');
    if (carousel) {
      const scrollAmount = 300;
      carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  }

  async loadTeacherData() {
    try {
      const { additionalUsers, randomUserMock } = await import('./FE4U-Lab2-mock.js');
      const mergedUsers = getAllUsers(randomUserMock, additionalUsers);
      const validatedUsers = validateUsers(mergedUsers);
      
      this.teachers = mergedUsers;
      this.filteredTeachers = [...this.teachers];
      
      const initialFavorites = this.teachers.filter(teacher => teacher.favorite).map(t => t.id);
      this.favorites = new Set(initialFavorites);
      
    } catch (error) {
      console.warn('Could not load external data, using fallback:', error);
      throw error;
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('favorite-btn')) {
        const teacherId = e.target.dataset.id;
        this.toggleFavorite(teacherId, e.target);
      } else if (e.target.closest('.teacher-info')) {
        const card = e.target.closest('.teacher-info');
        const teacherId = card.querySelector('.favorite-btn')?.dataset.id;
        if (teacherId && !e.target.classList.contains('favorite-btn')) {
          this.showTeacherPopup(teacherId);
        }
      }
    });

    const addTeacherButtons = document.querySelectorAll('.add-teacher-btn');
    addTeacherButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAddTeacherPopup();
      });
    });

    const ageFilter = document.getElementById('age-filter');
    const countryFilter = document.getElementById('region-filter');
    const genderFilter = document.getElementById('gender-filter');
    const photoFilter = document.getElementById('photo-only');
    const favoritesFilter = document.getElementById('favorites-only');

    if (ageFilter) {
      ageFilter.addEventListener('change', () => {
        console.log('Age filter changed');
        this.applyFilters();
      });
    }
    if (countryFilter) {
      countryFilter.addEventListener('change', () => {
        console.log('Country filter changed');
        this.applyFilters();
      });
    }
    if (genderFilter) {
      genderFilter.addEventListener('change', () => {
        console.log('Gender filter changed');
        this.applyFilters();
      });
    }
    if (photoFilter) {
      photoFilter.addEventListener('change', () => {
        console.log('Photo filter changed');
        this.applyFilters();
      });
    }
    if (favoritesFilter) {
      favoritesFilter.addEventListener('change', () => {
        console.log('Favorites filter changed');
        this.applyFilters();
      });
    }

    const leftArrow = document.querySelector('.arrow.left');
    const rightArrow = document.querySelector('.arrow.right');
    
    if (leftArrow) {
      leftArrow.addEventListener('click', () => this.scrollCarousel(-1));
    }
    if (rightArrow) {
      rightArrow.addEventListener('click', () => this.scrollCarousel(1));
    }

    const searchInput = document.getElementById('search-line');
    const searchButton = document.getElementById('search-button');

    if (searchButton) {
      searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performSearch();
        }
      });
    }
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing TeacherManager...');
  
  try {
    const teacherManager = new TeacherManager();
    await teacherManager.init();
  
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    const grid = document.querySelector('.teachers-grid');
    if (grid) {
      grid.innerHTML = '<p class="error-message">Failed to load teacher data. Please refresh the page.</p>';
    }
  }
});