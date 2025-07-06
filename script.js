let income = 0;
let expense = 0;
let entries = [];

function addEntry(description, amount, type, imported = false) {
  if (!imported) {
    description = document.getElementById("description").value.trim();
    amount = parseFloat(document.getElementById("amount").value);
    type = document.getElementById("type").value;

    if (!description || isNaN(amount)) {
      alert("Enter valid info.");
      return;
    }
  }

  const entry = { description, amount, type };
  entries.push(entry);

  if (type === "income") income += amount;
  else expense += amount;

  if (!imported) {
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "income";
  }

  updateUI();
}

function deleteEntry(index) {
  const entry = entries[index];
  if (entry.type === "income") income -= entry.amount;
  else expense -= entry.amount;
  entries.splice(index, 1);
  updateUI();
}

function updateUI() {
  document.getElementById("income").textContent = income.toFixed(2);
  document.getElementById("expense").textContent = expense.toFixed(2);
  document.getElementById("balance").textContent = (income - expense).toFixed(2);

  const list = document.getElementById("entries");
  list.innerHTML = "";

  entries.forEach((e, i) => {
    const li = document.createElement("li");
    li.textContent = `${e.description}: ${e.type === "income" ? "+" : "-"}${e.amount.toFixed(2)}`;
    
    const delBtn = document.createElement("button");
    delBtn.textContent = "x";
    delBtn.onclick = () => deleteEntry(i);

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function downloadExcel() {
  const data = [
    ["Description", "Type", "Amount"],
    ...entries.map(e => [e.description, e.type, e.amount]),
    [],
    ["Total Income", "", income],
    ["Total Expenses", "", expense],
    ["Balance", "", income - expense]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  XLSX.writeFile(wb, "Income_Expense_Report.xlsx");
}

function importExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Reset all
    income = 0;
    expense = 0;
    entries = [];

    rows.slice(1).forEach(row => {
      const [description, type, amount] = row;
      if (description && type && !isNaN(amount)) {
        addEntry(description, parseFloat(amount), type, true);
      }
    });

    updateUI();
  };
  reader.readAsArrayBuffer(file);
}
