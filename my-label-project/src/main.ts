import { LableApiResponse, classify, fetchLabels } from "./api";
import { Label } from "./types";

const classifyBtn = document.getElementById(
  "classify-button"
) as HTMLButtonElement;
const labelBtn = document.getElementById("label-button") as HTMLButtonElement;

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

    const classifyResp = await classify(sentence);
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

  const labelApiResp = await fetchLabels(sentence);

  drawLabels(labelApiResp.labels, sentence);
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
    let symbol=``;
    if(curr.successor?.junctor!==null){
      switch (curr.successor?.junctor) {
        case 'AND':
          // handle AND case
          symbol='&&'
          break;
        case 'OR':
          // handle OR case
          symbol='||'
          break;        
        default:
          symbol='';
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
