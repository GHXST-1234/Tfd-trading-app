let marketItems = [];
let currentCategory = "ALL";
let currentSort = "sales";

document.querySelectorAll("#themes button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.documentElement.setAttribute("data-theme", btn.dataset.setTheme);
    document.querySelectorAll("#themes button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

document.querySelectorAll("#categories button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.cat;
    document.querySelectorAll("#categories button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

function sortByHot() { currentSort = "sales"; render(); }
function sortByPrice() { currentSort = "price"; render(); }

async function loadMarketData() {
  try {
    const res = await fetch(`./prices.json?t=${Date.now()}`);
    const data = await res.json();
    marketItems = data.items || [];
    document.getElementById("lastUpdated").textContent = `Updated: ${new Date(data.updatedAt).toLocaleTimeString()}`;
    render();
  } catch (err) {
    document.getElementById("lastUpdated").textContent = "Waiting for prices.json...";
  }
}

function copyWhisper(itemName, price) {
  const msg = `WTS [${itemName}] ${price} Caliber`;
  navigator.clipboard.writeText(msg);
  alert(`Copied:\n${msg}`);
}

function render() {
  const desc = document.getElementById("descendantFilter").value;
  const stat = document.getElementById("statFilter").value;
  const query = document.getElementById("searchInput").value.toLowerCase();

  let filtered = marketItems.filter(item => {
    const matchCat = currentCategory === "ALL" || item.category === currentCategory;
    const matchDesc = desc === "ALL" || item.descendant === desc;
    const matchStat = stat === "ALL" || item.statTag.includes(stat);
    const matchSearch = item.name.toLowerCase().includes(query) || item.rolls.toLowerCase().includes(query);
    return matchCat && matchDesc && matchStat && matchSearch;
  });

  filtered.sort((a, b) => currentSort === "sales" ? b.sales24h - a.sales24h : b.recommendedPrice - a.recommendedPrice);
  document.getElementById("itemCount").textContent = `${filtered.length} hot listings`;

  const grid = document.getElementById("marketGrid");
  grid.innerHTML = filtered.map(item => `
    <div class="card">
      <div class="card-top">
        <strong>${item.name}</strong>
        <span class="badge">🔥 ${item.sales24h} sold/24h</span>
      </div>
      <div class="meta">${item.category} • ${item.descendant}</div>
      <div class="meta">Rolls: ${item.rolls}</div>
      <div class="price-box">
        <div>
          <span class="price-label">Lowest Active</span>
          <span class="price-val">${item.lowestPrice} Cal</span>
        </div>
        <div style="text-align:right">
          <span class="price-label">Good Sell Price</span>
          <span class="price-val">${item.recommendedPrice} Cal</span>
        </div>
      </div>
      <button class="copy-btn" onclick="copyWhisper('${item.name}', ${item.recommendedPrice})">📋 Copy WTS Message</button>
    </div>
  `).join("");
}

loadMarketData();
setInterval(loadMarketData, 60000);
