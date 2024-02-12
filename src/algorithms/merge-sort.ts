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
@customElement("merge-sort")
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
  highlightedValue = -1;

  @property({ type: Object })
  secondaryHighlight = {};

  @property({ type: Object })
  highlightRange = {};

  @property({ type: Number })
  timeout = 0;

  mergeSort(initialArray: Array<number>) {
    let currentArray = [...initialArray];
    function merge(
      leftArr: Array<number>,
      rightArr: Array<number>
    ): Array<number> {
      let array = [];
      while (leftArr?.length && rightArr?.length) {
        if (leftArr[0] < rightArr[0]) {
          array.push(leftArr.shift());
        } else {
          array.push(rightArr.shift());
        }
      }

      return [
        ...array,
        ...(leftArr || []),
        ...(rightArr || []),
      ] as Array<number>;
    }

    function* mergeSort(
      unsortedArr: Array<number>,
      startIndex: number = 0
    ): any {
      const middleIndex = Math.ceil(unsortedArr.length / 2);

      if (unsortedArr?.length < 2) {
        return {
          subArr: unsortedArr,
          array: currentArray,
          highlightRange: {
            start: startIndex,
            end: startIndex + unsortedArr.length,
          },
        };
      }
      const leftSubArr = unsortedArr.splice(0, middleIndex);

      yield {
        subArr: unsortedArr,
        array: currentArray,
        highlightRange: {
          start: startIndex,
          end: startIndex + unsortedArr.length,
        },
      };

      const left = yield* mergeSort(leftSubArr, startIndex) || {};
      const right = yield* mergeSort(unsortedArr, startIndex + middleIndex) ||
        {};

      const mergedValues = merge(left?.subArr, right?.subArr);

      yield {
        subArr: mergedValues,
        array: currentArray,
        highlightRange: {
          start: startIndex,
          end: startIndex + mergedValues.length,
        },
        secondaryHighlight: {
          start: startIndex,
          end: startIndex + mergedValues.length,
        },
      };

      currentArray.splice(startIndex, mergedValues.length, ...mergedValues);

      yield {
        subArr: mergedValues,
        array: currentArray,
        highlightRange: {
          start: startIndex,
          end: startIndex + mergedValues.length,
        },
        secondaryHighlight: {
          start: startIndex,
          end: startIndex + mergedValues.length,
        },
      };

      return {
        subArr: mergedValues,
        array: currentArray,
        highlightRange:
          unsortedArr.length === initialArray.length
            ? {}
            : {
                start: startIndex,
                end: startIndex + mergedValues.length,
              },
        secondaryHighlight:
          unsortedArr.length === initialArray.length
            ? {}
            : {
                start: startIndex,
                end: startIndex + mergedValues.length,
              },
      };
    }

    return mergeSort(initialArray);
  }

  startMergeSort() {
    const startingArray = [...this.array];
    const mergeSortGenerator = this.mergeSort(startingArray);

    const shiftArray = (skipTimeout?: boolean) => {
      setTimeout(
        () => {
          const nextValue = mergeSortGenerator?.next()?.value;
          if (nextValue) {
            const {
              array,
              highlightedValue,
              highlightRange,
              secondaryHighlight,
              skip,
            } = nextValue;
            this.array = array;
            this.highlightRange = highlightRange;
            this.highlightedValue = highlightedValue;
            this.secondaryHighlight = secondaryHighlight || {};
            shiftArray(skip);
          }
        },
        skipTimeout ? 0 : 250
      );
    };
    shiftArray();
  }

  connectedCallback() {
    super.connectedCallback();
    this.startMergeSort();
  }

  resetValues() {
    clearTimeout(this.timeout);
    this.highlightedValue = 0;
    this.highlightRange = {};
    this.secondaryHighlight = {};
    this.array = shuffleArray(
      [...new Array(Number(this.count))].map((_: unknown, i: number) => i + 1)
    );

    this.startMergeSort();
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
    "merge-sort": MyElement;
  }
}
