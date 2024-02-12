import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit-html/directives/style-map.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("randomized-array")
export class RandomizedArray extends LitElement {
  @property({ type: String })
  values = "[]";

  @property({ type: String })
  highlightRange = "{}";

  @property({ type: String })
  highlighted = "0";

  @property({ type: String })
  secondaryHighlight = "{}";

  render() {
    const array = JSON.parse(this.values);
    const highlightRange = JSON.parse(this.highlightRange);
    const highlightedValues = JSON.parse(this.secondaryHighlight);
    const height = 200 / array.length;
    const rect = this.getBoundingClientRect();
    const containerWidth = (rect.width > 600 ? 600 : rect.width) || 400;
    const width = containerWidth / array.length;

    return html`
      <div
        class="sort__container"
        style=${styleMap({
          width: containerWidth,
          opacity: rect?.width === 0 ? 0 : 1,
        })}
      >
        ${highlightRange.end &&
        html`<div
          class="sort-border"
          style=${styleMap({
            left: `${highlightRange.start * width}px`,
            width: `${
              (highlightRange.end - highlightRange.start) * width - 5
            }px`,
          })}
        ></div>`}
        ${array.map((num: number, index: number) => {
          const stylesContainer = styleMap({
            height: `${num * height}px`,
            left: `${index * width}px`,
            width: `${width - 3}px`,
          });
          const isHighlighted = parseInt(this.highlighted) === index;
          const isSecondaryHighlight = isNaN(highlightedValues?.start)
            ? false
            : index >= highlightedValues.start && index < highlightedValues.end;

          const stylesItem = styleMap({
            backgroundColor: isHighlighted
              ? "#ff6f6f"
              : isSecondaryHighlight
              ? "#ffe1b6"
              : `hsl(240, 50%, ${(1 - num / this.values.length) * 100}%)`,
          });

          return html`<div class="item__container" style=${stylesContainer}>
            <div class="item" value=${num} style=${stylesItem}></div>
          </div>`;
        })}
      </div>
    `;
  }

  static styles = css`
    .sort__container {
      overflow: hidden;
      position: relative;
      height: 200px;
      margin: 0 auto;
      max-width: 600px;
    }

    .sort-border {
      position: absolute;
      border: 2px solid red;
      height: calc(100% - 7px);
      bottom: 3px;
      z-index: 1;
    }

    .item {
      height: 100%;
    }

    .item__container {
      position: absolute;
      bottom: 5px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "randomized-array": RandomizedArray;
  }
}
