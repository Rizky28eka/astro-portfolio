import 'solid-js';
import { SliderOptions } from 'solid-slider';

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      slider: SliderOptions;
    }
  }
}
