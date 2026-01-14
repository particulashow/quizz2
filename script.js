const params = new URLSearchParams(window.location.search);

const domain = params.get("domain") || "http://localhost:3900";

const title = params.get("title") || "Pergunta";
const aText = params.get("a") || "Opção A";
const bText = params.get("b") || "Opção B";

function norm(s){
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Render imediato
document.getElementById("title").textContent = title;
document.getElementById("text_a").textContent = aText;
document.getElementById("text_b").textContent = bText;

const statusEl = document.getElementById("status");

function updateUI(counts){
  const total = (counts.a + counts.b) || 1;

  document.getElementById("count_a").textContent = counts.a;
  document.getElementById("count_b").textContent = counts.b;

  document.getElementById("fill_a").style.width = `${(counts.a / total) * 100}%`;
  document.getElementById("fill_b").style.width = `${(counts.b / total) * 100}%`;

  statusEl.textContent = `Votos: ${counts.a + counts.b}`;
}

// Limpa votos no arranque
fetch(`${domain}/clear-chat?words=a,b`)
  .then(() => setTimeout(fetchData, 500))
  .catch(() => { statusEl.textContent = "Sem ligação ao servidor"; });

async function fetchData(){
  try{
    const res = await fetch(`${domain}/wordcloud`, { cache: "no-store" });
    const data = await res.json();

    const arr = (data.wordcloud || "")
      .split(",")
      .map(norm)
      .filter(Boolean);

    const counts = { a:0, b:0 };

    for (const w of arr){
      if (w === "a" || w === "b"){
        counts[w]++;
      }
    }

    updateUI(counts);
    if (statusEl.textContent.startsWith("Sem ligação")) {
      statusEl.textContent = "A ler comentários…";
    }
  } catch(e){
    statusEl.textContent = "Erro ao ler wordcloud…";
  }
}

setInterval(fetchData, 1000);
