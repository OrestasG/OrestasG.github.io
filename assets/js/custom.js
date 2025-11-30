document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const resultArea = document.getElementById('resultArea');
  const popup = document.getElementById('popup');
  const popupClose = document.getElementById('popupClose');

  const fields = {
    name: document.getElementById('name'),
    surname: document.getElementById('surname'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    address: document.getElementById('address')
  };

  const ratings = [
    document.getElementById('r1'),
    document.getElementById('r2'),
    document.getElementById('r3')
  ];

  // show outputs next to ranges
  ratings.forEach((r, i) => {
    const out = document.getElementById(r.id + 'Out');
    r.addEventListener('input', () => { out.value = r.value; });
  });

  // validation helpers
  const validators = {
    name: v => /^[A-Za-zĄČĘĖĮŠŲŪаąčęėįšųūž-яА-Я\-\s]+$/.test(v.trim()),
    surname: v => /^[A-Za-zĄČĘĖĮŠŲŪąčęėįšųūžа-яА-Я\-\s]+$/.test(v.trim()),
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    address: v => v.trim().length > 0,
    phone: v => /^\+370\s6\d{2}\s\d{3}\s\d{2}$/.test(v)
  };

  function setError(field, message) {
    const el = fields[field];
    el.classList.add('invalid');
    const small = form.querySelector(`small.error[data-for="${field}"]`);
    if (small) small.textContent = message;
  }

  function clearError(field) {
    const el = fields[field];
    el.classList.remove('invalid');
    const small = form.querySelector(`small.error[data-for="${field}"]`);
    if (small) small.textContent = '';
  }

  function validateField(field) {
    const value = fields[field].value;
    if (!value.trim()) { setError(field, 'Laukas privalomas'); return false; }
    if (!validators[field](value)) {
      const msgs = {
        name: 'Vardas turi būti sudarytas tik iš raidžių',
        surname: 'Pavardė turi būti sudaryta tik iš raidžių',
        email: 'Neteisingas el. pašto formatas',
        address: 'Įveskite adresą kaip tekstą',
        phone: 'Telefono formatas turi būti +370 6xx xxx xxx'
      };
      setError(field, msgs[field]);
      return false;
    }
    clearError(field);
    return true;
  }

  // real-time validation listeners (except phone has special logic)
  ['name','surname','email','address'].forEach(f => {
    fields[f].addEventListener('input', () => {
      validateField(f);
      toggleSubmit();
    });
  });

  // PHONE: allow only digits, auto-format to +370 6xx xxx xxx
  fields.phone.addEventListener('input', e => {
    const raw = fields.phone.value.replace(/[^0-9]/g, '');
    // if user already typed country, allow them to type starting with 370 or 8/6
    let formatted = '';
    // if begins with 370 or starts with 8/6 — try to normalize
    if (raw.startsWith('370')) {
      const body = raw.slice(3);
      formatted = '+370 ' + formatLithuanian(body);
    } else if (raw.startsWith('8')) {
      // local dialing starting with 8 -> treat as 6... drop leading 8
      const body = raw.slice(1);
      formatted = '+370 ' + formatLithuanian(body);
    } else if (raw.startsWith('6')) {
      formatted = '+370 ' + formatLithuanian(raw);
    } else if (raw.length === 0) {
      formatted = '';
    } else {
      // fallback: show digits
      formatted = raw;
    }
    fields.phone.value = formatted;
    // live validation hint but don't block user aggressively
    if (formatted && validators.phone(formatted)) clearError('phone');
    else if (formatted.length > 0) setError('phone', 'Telefono formatas turi būti +370 6xx xxx xxx');

    toggleSubmit();
  });

  function formatLithuanian(digits) {
    // digits expected starting with 6 and then up to 8 more digits
    const match = digits.match(/^(6?)(\d{0,2})(\d{0,3})(\d{0,3})/);
    if (!match) return digits;
    const part1 = match[1] ? (match[1] + match[2]) : match[2];
    const part2 = match[3] || '';
    const part3 = match[4] || '';
    let out = part1;
    if (part2) out += ' ' + part2;
    if (part3) out += ' ' + part3;
    return out.trim();
  }

  // enable submit only if no validation errors and required fields ok
  function toggleSubmit() {
    const ok = ['name','surname','email','address','phone'].every(f => validators[f](fields[f].value));
    submitBtn.disabled = !ok;
  }

  // on submit: prevent default, collect values, console.log object, show below
  form.addEventListener('submit', e => {
    e.preventDefault();
    // final validate
    let allOk = true;
    ['name','surname','email','address','phone'].forEach(f => { if (!validateField(f)) allOk = false; });
    if (!allOk) { toggleSubmit(); return; }

    // collect
    const data = {
      name: fields.name.value.trim(),
      surname: fields.surname.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      address: fields.address.value.trim(),
      ratings: ratings.map(r => Number(r.value))
    };

    console.log('Contact form submitted:', data);

    // calculate average of ratings with one decimal
    const avg = (data.ratings.reduce((a,b)=>a+b,0) / data.ratings.length);
    const avgFixed = Math.round(avg * 10) / 10;

    // show below the form
    resultArea.innerHTML = `\n      <div class="result-box">\n        Vardas: ${escapeHtml(data.name)}<br>\n        Pavardė: ${escapeHtml(data.surname)}<br>\n        El. paštas: <a href=\"mailto:${escapeAttr(data.email)}\">${escapeHtml(data.email)}</a><br>\n        Tel. Numeris: ${escapeHtml(data.phone)}<br>\n        Vidurkis: ${escapeHtml(data.name)} ${escapeHtml(data.surname)}: ${avgFixed}\n      </div>`;

    // show popup
    showPopup();

    // reset form if you want (optional) — commented out
    // form.reset(); toggleSubmit();
  });

  popupClose.addEventListener('click', () => { hidePopup(); });

  function showPopup() {
    popup.classList.remove('hidden');
    popup.setAttribute('aria-hidden', 'false');
  }
  function hidePopup() {
    popup.classList.add('hidden');
    popup.setAttribute('aria-hidden', 'true');
  }

  // tiny helpers to avoid XSS in displayed HTML
  function escapeHtml(s) {
    return (s+'').replace(/[&<>\\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'\\\\','"':'&quot;',"'":'&#39;'})[c]);
  }
  function escapeAttr(s){ return escapeHtml(s).replace(/\n/g,''); }

  // initial toggle
  toggleSubmit();
});