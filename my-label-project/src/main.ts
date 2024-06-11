import { LableApiResponse, classify, fetchLabels, fetchTestSuite } from "./api";
import { Case, Condition, Expected, JsonData, Label } from "./types";

const classifyBtn = document.getElementById(
  "classify-button"
) as HTMLButtonElement;
const labelBtn = document.getElementById("label-button") as HTMLButtonElement;
const testSuiteBtn = document.getElementById(
  "testsuite-button"
) as HTMLButtonElement;

classifyBtn.addEventListener("click", async () => {
  const classifyResult = document.getElementById(
    "classify-result"
  ) as HTMLElement;
  const labelButton = document.getElementById("label-button") as HTMLElement;
  const errorPlace = document.getElementById("error-txt") as HTMLElement;

  classifyResult.style.display = "none";
  labelButton.style.display = "none";

  let sentence = (document.getElementById("input-sentence") as HTMLInputElement)
    .value;
  if (sentence.length === 0) {
    errorPlace.innerHTML = "please enter valid sentence";

    setTimeout(() => {
      errorPlace.innerHTML = "";
    }, 3000);
  } else {
    if (sentence[sentence.length - 1] !== ".") {
      sentence += ".";
    }
    showLoader("loader1");
    (document.getElementById("classify-txt") as HTMLElement).style.display =
      "none";

    const classifyResp = await classify(sentence);
    hideLoader("loader1");
    (document.getElementById("classify-txt") as HTMLElement).style.display =
      "block";
    console.log(classifyResp);

    classifyResult.innerHTML = `${
      classifyResp.causal === true ? "Causal" : "Not Causal"
    } with confidence of ${classifyResp.confidence.toFixed(2)} %.`;
    classifyResult.style.display = "block";

    if (classifyResp.causal === true) {
      labelButton.style.display = "block";
    }
  }
});

labelBtn.addEventListener("click", async () => {
  let sentence =
    (document.getElementById("input-sentence") as HTMLInputElement).value ?? "";

  showLoader("loader2");
  (document.getElementById("label-txt") as HTMLElement).style.display = "none";

  const labelApiResp = await fetchLabels(sentence);

  testSuiteBtn.style.display = "block";

  drawLabels(labelApiResp.labels, sentence);
  hideLoader("loader2");
  (document.getElementById("label-txt") as HTMLElement).style.display = "block";
});

const drawLabels = (labels: Label[], sentence: string) => {
  const rootPlace = document.getElementById("labels-container") as HTMLElement;

  let curr: Label | undefined = labels[0];
  let str = ``;

  const causePattern = /^Cause\d+$/;
  const effectPattern = /^Effect\d+$/;

  while (curr !== undefined) {
    str += `<div class="parent">`;
    // console.log(curr);
    str += `
        <div class="${causePattern.test(curr!.name) ? "parent-cause" : ""} ${
      effectPattern.test(curr!.name) ? "parent-effect" : ""
    }">
            ${curr!.name}
        </div>`;

    str += `<div class="inner-parent">`;

    let children = [];

    for (const child of curr.children) {
      const childObj = labels.find((l) => l.id === child);
      children.push(childObj);
    }
    children.sort((a, b) => a!.begin - b!.begin);

    for (const childObj of children) {
      str += `
      <div class="block ${childObj?.name}">
            <p>${childObj?.name}</p>
            <p> ${sentence.substring(childObj?.begin ?? 0, childObj?.end)} </p>
        </div>
      `;
    }

    str += `</div>`;
    str += `</div>`;
    let symbol = ``;
    if (curr.successor?.junctor !== null) {
      switch (curr.successor?.junctor) {
        case "AND":
          // handle AND case
          symbol = "&&";
          break;
        case "OR":
          // handle OR case
          symbol = "||";
          break;
        default:
          symbol = "";
          break;
      }
      str += `<div class="parent">`;
      str += `<div class="block">`;
      str += `${symbol}`;
      str += `</div>`;
      str += `</div>`;
    }

    const nextId: string = curr?.successor?.id ?? "";
    const nextObj = labels.find((l) => l.id === nextId);
    curr = nextObj;
  }

  rootPlace.innerHTML = str;
};

testSuiteBtn.addEventListener("click", async () => {
  let sentence =
    (document.getElementById("input-sentence") as HTMLInputElement).value ?? "";
  showLoader("loader3");
  (document.getElementById("test-txt") as HTMLElement).style.display = "none";

  const JsonData = await fetchTestSuite(sentence);

  createTableFromJSON(JsonData);

  hideLoader("loader3");
  (document.getElementById("test-txt") as HTMLElement).style.display = "block";
});

function createTableFromJSON(jsonData: JsonData) {
  const table = document.getElementById("dynamicTable") as HTMLTableElement;
  const thead = table.querySelector("thead") as HTMLTableSectionElement;
  const tbody = table.querySelector("tbody") as HTMLTableSectionElement;

  const conditions = jsonData.suite.conditions;
  const expected = jsonData.suite.expected;

  // Clear any existing content
  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Create header rows
  const headerRow1 = document.createElement("tr");
  const headerRow2 = document.createElement("tr");

  const idHeader = document.createElement("th");
  idHeader.rowSpan = 2;
  idHeader.textContent = "ID";
  headerRow1.appendChild(idHeader);

  const inputHeader = document.createElement("th");
  inputHeader.colSpan = conditions.length;
  inputHeader.textContent = "Input";
  headerRow1.appendChild(inputHeader);

  conditions.forEach((condition: Condition, index: number) => {
    const th = document.createElement("th");
    th.id = `inputVariable${index + 1}`;
    th.textContent = condition.variable;
    headerRow2.appendChild(th);
  });

  const outputHeader = document.createElement("th");
  outputHeader.colSpan = expected.length;
  outputHeader.textContent = "Output";
  headerRow1.appendChild(outputHeader);

  expected.forEach((expectation: Expected, index: number) => {
    const th = document.createElement("th");
    th.id = `outputVariable${index + 1}`;
    th.textContent = expectation.variable;
    headerRow2.appendChild(th);
  });

  thead.appendChild(headerRow1);
  thead.appendChild(headerRow2);

  // Create body rows
  const cases = jsonData.suite.cases;
  let id = 1;

  cases.forEach((caseItem: Case) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = id.toString();
    id++;
    row.appendChild(idCell);

    conditions.forEach((condition: Condition, index: number) => {
      const inputCell = document.createElement("td");
      const conditionKey = `P${index}`;
      inputCell.textContent = caseItem[conditionKey]
        ? condition.condition
        : "not " + condition.condition;
      row.appendChild(inputCell);
    });

    expected.forEach((expectation: Expected, index: number) => {
      const outputCell = document.createElement("td");
      const expectationKey = `P${index + conditions.length}`;
      outputCell.textContent = caseItem[expectationKey]
        ? expectation.condition
        : "not " + expectation.condition;
      row.appendChild(outputCell);
    });

    tbody.appendChild(row);
  });
}

// Function to show and hide loader
function showLoader(id: string) {
  (document.getElementById(id) as HTMLElement).style.display = "block";
}

function hideLoader(id: string) {
  (document.getElementById(id) as HTMLElement).style.display = "none";
}
