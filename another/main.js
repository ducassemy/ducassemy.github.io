const sheets = "sheetportfolio - Feuille 1.csv";


const response = await fetch(sheets);
const csvText = await response.text();


const sanitizeName = (name) => {
  const accentsMap = new Map([
    ['á','a'],['à','a'],['â','a'],['ä','a'],['ã','a'],['å','a'],
    ['é','e'],['è','e'],['ê','e'],['ë','e'],
    ['í','i'],['ì','i'],['î','i'],['ï','i'],
    ['ó','o'],['ò','o'],['ô','o'],['ö','o'],['õ','o'],['ø','o'],
    ['ú','u'],['ù','u'],['û','u'],['ü','u'],
    ['ý','y'],['ÿ','y'],['ñ','n'],['ç','c']
  ]);

  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};


const csvToJson = (csvString) => {
  try {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;

    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    if (currentLine) lines.push(currentLine);

    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = [];
      let currentValue = '';
      let inQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);

      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';

        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        value = value.replace(/\r/g, '');

        if (value.includes('\n')) {
          value = value.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        }

        obj[header] = value;
      });

      result.push(obj);
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};


const bgColors = ["white"];


const json = csvToJson(csvText);
console.log(json);

const $projets = document.querySelector(".projets");

json.forEach((item) => {
  const div = document.createElement("div");
  $projets.appendChild(div);

  gsap.set(div, { backgroundColor: () => gsap.utils.random(bgColors) });
  gsap.from(div, {
    x: () => gsap.utils.random(-1000, 1000),
    y: () => gsap.utils.random(-1000, -20),
    opacity: 0,
    duration: 0.5
  });

  const img = document.createElement("img");
  img.src = `img/${sanitizeName(item.titre)}.jpeg`;
  div.appendChild(img);

  gsap.set(img, { filter: "blur(3px) contrast(200%)" });

  const pixelAnim = gsap.to(img, {
    x: "+=7",
    y: "+=8",
    yoyo: true,
    repeat: -1,
    duration: 1,
    ease: "sine.inOut"
  });

  img.addEventListener("mouseenter", () => {
    gsap.to(img, { filter: "blur(0px) contrast(100%)", duration: 0.3 });
    pixelAnim.pause();
  });

  img.addEventListener("mouseleave", () => {
    gsap.to(img, { filter: "blur(3px) contrast(200%)", duration: 0.3 });
    pixelAnim.resume();
  });

  const titre = document.createElement("h1");
  titre.textContent = item.titre;
  div.appendChild(titre);

  const categories = document.createElement("div");
  categories.textContent = item.catégories;
  div.appendChild(categories);

  const description = document.createElement("p");
  description.textContent = item.description;
  div.appendChild(description);

  
  div.addEventListener("click", () => {
    const header = document.querySelector("header");
    const projets = document.querySelector(".projets");

    header.classList.add("fixed");
    projets.classList.add("fixed");
    document.body.classList.add("noscroll");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche");
    wrap.appendChild(fiche);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    overlay.appendChild(close);

    close.addEventListener("click", () => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          overlay.remove();
          header.classList.remove("fixed");
          projets.classList.remove("fixed");
          document.body.classList.remove("noscroll");
        }
      });
    });

    const modalImg = document.createElement("img");
    modalImg.src = `img/${sanitizeName(item.titre)}.png`;
    fiche.appendChild(modalImg);

    const modalTitle = document.createElement("h1");
    modalTitle.textContent = item.titre;
    fiche.appendChild(modalTitle);

    const desc = document.createElement("div");
    desc.innerHTML = item.modale;
    fiche.appendChild(desc);

    if (item.images !== "") {
      const gallery = document.createElement("div");
      gallery.classList.add("gallery");

      item.images.split(",").forEach((image) => {
        const galImg = document.createElement("img");
        galImg.src = `img/${sanitizeName(item.titre)}/${image.trim()}`;
        gallery.appendChild(galImg);
      });

      fiche.appendChild(gallery);
    }

    gsap.from(overlay, { opacity: 0, duration: 0.4 });
  });
});

