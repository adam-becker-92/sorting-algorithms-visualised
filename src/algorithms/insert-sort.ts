import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../shared/randomized-array";

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: Array<number>) {
  let returnArray = [...array];
  for (var i = returnArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = returnArray[i];
    returnArray[i] = returnArray[j];
    returnArray[j] = temp;
  }

  return returnArray;
}

/**
 * An example element.
 *
 * @csspart button - The button
 */
@customElement("insert-sort")
export class MyElement extends LitElement {
  @property({ type: Number })
  count = 16;
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Array<number> })
  array = shuffleArray(
    [...new Array(Number(this.count))].map((_: unknown, i: number) => i + 1)
  );

  @property({ type: Number })
  highlightedValue = 0;

  @property({ type: Number })
  timeout = 0;

  *insertSort(initialArray: Array<number>) {
    //Start from the second element.
    for (let i = 1; i < initialArray.length; i++) {
      //Go through the elements behind it.
      for (let j = i - 1; j > -1; j--) {
        //value comparison using ascending order.
        yield {
          array: initialArray,
          highlightedValue: j + 1,
        };
        if (initialArray[j + 1] < initialArray[j]) {
          //swap
          [initialArray[j + 1], initialArray[j]] = [
            initialArray[j],
            initialArray[j + 1],
          ];
        }
      }
    }

    yield {
      array: initialArray,
      highlightedValue: 0,
    };

    yield {
      array: initialArray,
      highlightedValue: -1,
      skip: false,
    };
  }

  startinsertSort() {
    const startingArray = [...this.array];
    const insertSortGenerator = this.insertSort(startingArray);

    const shiftArray = (skipTimeout?: boolean) => {
      this.timeout = setTimeout(
        () => {
          const nextValue = insertSortGenerator?.next()?.value;
          if (nextValue) {
            const { array, highlightedValue, skip } = nextValue;
            this.array = array;
            this.highlightedValue = highlightedValue;
            shiftArray(skip);
          }
        },
        skipTimeout ? 0 : 100
      ) as any;
    };
    shiftArray();
  }

  connectedCallback() {
    super.connectedCallback();
    this.startinsertSort();
  }

  resetValues() {
    clearTimeout(this.timeout);
    this.highlightedValue = 0;
    this.array = shuffleArray(
      [...new Array(Number(this.count))].map((_: unknown, i: number) => i + 1)
    );

    this.startinsertSort();
  }

  render() {
    return html`
      <randomized-array
        .values=${JSON.stringify(this.array)}
        .highlighted=${this.highlightedValue}
      ></randomized-array>
      <button @click=${this.resetValues}>Reset Algorithm</button>
    `;
  }

  static styles = css`
    :host {
      display: block;
      margin: 0 auto;
      padding: 0.5rem;
      text-align: center;
    }

    button {
      margin-top: 8px;
      width: auto;
      height: 35px;
      background-color: white;
      border: 1px solid grey;
      border-radius: 4px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "insert-sort": MyElement;
  }
}
