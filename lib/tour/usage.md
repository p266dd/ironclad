### Global `layout.tsx`

```tsx
<TourProvider>
  <Tour tours={steps}>{children}</Tour>
</TourProvider>
```

### Components & `page.tsx`

Target anything in your app using the elements `id` attribute.

```tsx
<div id="step1">Tour Step</div>
```

### Custom Card

If you require greater control over the card design or simply wish to create a totally custom component then you can do so easily.

| Prop          | Type     | Description                                                                     |
| ------------- | -------- | ------------------------------------------------------------------------------- |
| `step`        | `Object` | The current `Step` object from your steps array, including content, title, etc. |
| `currentStep` | `number` | The index of the current step in the steps array.                               |
| `totalSteps`  | `number` | The total number of steps in the onboarding process.                            |
| `nextStep`    |          | A function to advance to the next step in the onboarding process.               |
| `prevStep`    |          | A function to go back to the previous step in the onboarding process.           |
| `arrow`       |          | Returns an SVG object, the orientation is controlled by the steps side prop     |

```tsx
"use client";
import type { CardComponentProps } from "**types**";

export const CustomCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) => {
  // Design your card below.
  return (
    <div>
      <h1>
        {step.icon} {step.title}
      </h1>
      <h2>
        {currentStep} of {totalSteps}
      </h2>
      <p>{step.content}</p>
      <button onClick={prevStep}>Previous</button>
      <button onClick={nextStep}>Next</button>
      {arrow}
    </div>
  );
};
```

### Tours object

Supports multiple "tours" so you have the option to create multple product tours should you need to!

```tsx
{
  tour: "firstyour",
  steps: [
    Steps...
  ],
  tour: "secondtour",
  steps: [
    Steps...
  ]
}
```

### Step object

| Prop             | Type                                     | Description                                                                                          |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `icon`           | `React.ReactNode`, `string`, `null`      | Optional. An icon or element to display alongside the step title.                                    |
| `title`          | `string`                                 | The title of your step                                                                               |
| `content`        | `React.ReactNode`                        | The main content or body of the step.                                                                |
| `selector`       | `string`                                 | A string used to target an `id` that this step refers to.                                            |
| `side`           | `"top"`, `"bottom"`, `"left"`, `"right"` | Optional. Determines where the tooltip should appear relative to the selector.                       |
| `showControls`   | `boolean`                                | Optional. Determines whether control buttons (next, prev) should be shown if using the default card. |
| `pointerPadding` | `number`                                 | Optional. The padding around the pointer (keyhole) highlighting the target element.                  |
| `pointerRadius`  | `number`                                 | Optional. The border-radius of the pointer (keyhole) highlighting the target element.                |
| `nextRoute`      | `string`                                 | Optional. The route to navigate to using `next/navigation` when moving to the next step.             |
| `prevRoute`      | `string`                                 | Optional. The route to navigate to using `next/navigation` when moving to the previous step.         |

> **Note** \_Both `nextRoute` and `prevRoute` have a `500`ms delay before setting the next step.

```tsx
{
  // ...Tour,
  steps: [
    {
      icon: <>👋</>,
      title: "Tour 1, Step 1",
      content: <>First tour, first step</>,
      selector: "#tour1-step1",
      side: "top",
      showControls: true,
      pointerPadding: 10,
      pointerRadius: 10,
      nextRoute: "/foo",
      prevRoute: "/bar"
    }
    ...
  ],
}
```

### Tour Component Props

| Property         | Type              | Description                                                                                                                                                                                                                                |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children`       | `React.ReactNode` | Your website or application content.                                                                                                                                                                                                       |
| `interact`       | `boolean`         | Optional. Controls whether the onboarding overlay should be interactive. Defaults to `false`.                                                                                                                                              |
| `Tours`          | `Array[]`         | An array of `Step` objects defining each step of the onboarding process.                                                                                                                                                                   |
| `showTour`       | `boolean`         | Optional. Controls the visibility of the onboarding overlay, eg. if the user is a first time visitor. Defaults to `false`.                                                                                                                 |
| `shadowRgb`      | `string`          | Optional. The RGB values for the shadow color surrounding the target area. Defaults to black `"0,0,0"`.                                                                                                                                    |
| `shadowOpacity`  | `string`          | Optional. The opacity value for the shadow surrounding the target area. Defaults to `"0.2"`                                                                                                                                                |
| `customCard`     | `React.ReactNode` | Optional. A custom card (or tooltip) that can be used to replace the default TailwindCSS card.                                                                                                                                             |
| `cardTransition` | `Transition`      | Transitions between steps are of the type Transition from [framer-motion](https://www.framer.com/motion/transition/), see the [transition docs](https://www.framer.com/motion/transition/) for more info. Example: `{{ type: "spring" }}`. |

```tsx
<Tour
  tours={tours}
  showTour={true}
  shadowRgb="55,48,163"
  shadowOpacity="0.8"
  cardComponent={CustomCard}
>
  {children}
</Tour>
```
