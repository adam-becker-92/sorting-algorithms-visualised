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
@customElement("quick-sort")
export class MyElement extends LitElement {
  @property({ type: Number })
  count = 16;
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Array<number>, attribute: false })
  array = shuffleArray(
    [...new Array(Number(this.count))].map((_: unknown, i: number) => i + 1)
  );

  @property({ type: Number, attribute: false })
  highlightedValue = 0;

  @property({ type: Object, attribute: false })
  secondaryHighlight = {};

  @property({ type: Object, attribute: false })
  highlightRange = {};

  @property({ type: Number, attribute: false })
  timeout = 0;

  quickSortGen(initialArray: Array<number>) {
    let currentArray = initialArray;
    function* quickSort(arr: Array<number>, startingPoint: number = 0): any {
      if (arr.length <= 1) {
        return;
      }

      yield {
        array: currentArray,
        highlightedValue: startingPoint,
        secondaryHighlight: {},
        highlightRange: {
          start: startingPoint,
          end: startingPoint + arr.length,
        },
      };

      let pivot = arr[0];
      let leftArr = [];
      let rightArr = [];

      for (let i = 1; i < arr.length; i++) {
        if (arr[i] < pivot) {
          leftArr.push(arr[i]);
        } else {
          rightArr.push(arr[i]);
        }

        yield {
          array: currentArray,
          highlightedValue: startingPoint,
          secondaryHighlight: {
            start: startingPoint + i,
            end: startingPoint + i + 1,
          },
          highlightRange: {
            start: startingPoint,
            end: startingPoint + arr.length,
          },
        };
      }

      currentArray.splice(
        startingPoint,
        arr.length,
        ...leftArr,
        pivot,
        ...rightArr
      );

      yield {
        array: currentArray,
        highlightedValue: startingPoint + leftArr.length,
        secondaryHighlight: {},
        highlightRange: {
          start: startingPoint,
          end: startingPoint + arr.length,
        },
      };

      if (leftArr.length > 1) {
        yield* quickSort(leftArr, startingPoint);
      }

      if (rightArr.length > 1) {
        yield* quickSort(rightArr, startingPoint + leftArr.length + 1);
      }

      if (arr.length === initialArray.length) {
        yield {
          array: currentArray,
          secondaryHighlight: {},
          highlightedValue: -1,
          highlightRange: {},
        };
      }
    }

    return quickSort(initialArray);
  }

  startQuickSort() {
    const startingArray = [...this.array];
    const quickSortGenerator = this.quickSortGen(startingArray);

    const shiftArray = () => {
      this.timeout = setTimeout(() => {
        const nextValue = quickSortGenerator?.next()?.value;
        if (nextValue) {
          const {
            array,
            highlightedValue,
            highlightRange,
            secondaryHighlight,
          } = nextValue;
          this.array = array;
          this.highlightRange = highlightRange;
          this.highlightedValue = highlightedValue;
          this.secondaryHighlight = secondaryHighlight;

          shiftArray();
        }
      }, 250) as any;
    };
    shiftArray();
  }

  connectedCallback() {
    super.connectedCallback();
    this.startQuickSort();
  }

  resetValues() {
    clearTimeout(this.timeout);
    this.highlightedValue = 0;
    this.highlightRange = {};
    this.secondaryHighlight = {};
    this.array = shuffleArray(
      [...new Array(Number(this.count))].map((_: unknown, i: number) => i + 1)
    );

    this.startQuickSort();
  }

  render() {
    return html`
      <randomized-array
        .values=${JSON.stringify(this.array)}
        .highlighted=${this.highlightedValue}
        .highlightRange=${JSON.stringify(this.highlightRange)}
        .secondaryHighlight=${JSON.stringify(this.secondaryHighlight)}
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
    "quick-sort": MyElement;
  }
}
