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
@customElement("bubble-sort")
export class MyElement extends LitElement {
  @property({ type: Number })
  count = 16;
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Array<number> })
  array = shuffleArray(
    [...new Array(this.count)].map((_: unknown, i: number) => i + 1)
  );

  @property({ type: Number })
  highlightedValue = 0;

  @property({ type: Number })
  timeout = 0;

  *bubbleSort(initialArray: Array<number>) {
    for (var i = 0; i < initialArray.length; i++) {
      for (var j = 0; j < initialArray.length - i - 1; j++) {
        yield {
          array: initialArray,
          highlightedValue: j,
          skip: false,
        };
        if (initialArray[j] > initialArray[j + 1]) {
          var temp = initialArray[j];
          initialArray[j] = initialArray[j + 1];
          initialArray[j + 1] = temp;
          yield {
            array: initialArray,
            highlightedValue: j + 1,
            skip: true,
          };
        }
      }
    }
    yield {
      array: initialArray,
      highlightedValue: -1,
      skip: true,
    };
  }

  startBubbleSort() {
    const startingArray = [...this.array];
    const bubbleSortGenerator = this.bubbleSort(startingArray);

    const shiftArray = (skipTimeout?: boolean) => {
      this.timeout = setTimeout(
        () => {
          const nextValue = bubbleSortGenerator?.next()?.value;
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
    this.startBubbleSort();
  }

  resetValues() {
    clearTimeout(this.timeout);
    this.highlightedValue = 0;
    this.array = shuffleArray(
      [...new Array(Number(this.count))].map((_: unknown, i: number) => i + 1)
    );

    this.startBubbleSort();
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
    "bubble-sort": MyElement;
  }
}
