import * as React from 'react';
import styles from './NumericDisplay.module.scss';

const DIGIT_TRANSITION_DURATION = 600;
const DIGIT_TRANSITION_DELAY = 100;

const Character = React.memo(
  (props: {
    children: React.ReactNode;
    shiftIndex?: string;
    index: number;
  }) => {
    return (
      <span
        data-shift-index={props.shiftIndex ?? 0}
        className={`${styles.NumericDisplay__Digit} flex h-full shrink-0 flex-col transition-transform`}
        style={
          {
            '--digit-transition-duration': `${DIGIT_TRANSITION_DURATION}ms`,
            '--digit-transition-delay': `${DIGIT_TRANSITION_DELAY * props.index}ms`,
          } as React.CSSProperties
        }
      >
        {props.children}
      </span>
    );
  }
);

const Digit = React.memo(
  (props: {
    shiftIndex?: string;
    index: number;
  }) => {
    return (
      <Character index={props.index} shiftIndex={props.shiftIndex}>
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
      </Character>
    );
  }
);

type Props = {
  children: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  minDecimalLength?: number;
  fractionLength?: number;
};

export const NumericDisplay = React.memo((props: Props) => {
  const [lastDecimalDigit, setLastDecimalDigit] = React.useState<readonly string[]>([]);

  const fractionDigitLength = Math.max(props.fractionLength ?? 0, 0);

  const [decimalDigits, fractionDigits] = React.useMemo(() => {
    const valueModifier = 10 ** fractionDigitLength;
    const [decimalValue, fractionValue = ''] = (
      Math.round(props.children * valueModifier) / valueModifier
    )
      .toFixed(fractionDigitLength)
      .split('.');

    /* By reversing the digits, first element with lowest index will be changed lowest. Correct order is restored by styling. */
    return [decimalValue.split('').reverse(), fractionValue.split('').reverse()];
  }, [props.children, fractionDigitLength]);

  const maxDigitCount = Math.max(
    props.minDecimalLength ?? 0,
    decimalDigits.length,
    lastDecimalDigit.length
  );

  React.useEffect(() => {
    const timerId = window.setTimeout(
      () => setLastDecimalDigit(decimalDigits),
      DIGIT_TRANSITION_DURATION + DIGIT_TRANSITION_DELAY * maxDigitCount
    );

    return () => window.clearTimeout(timerId);
  }, [decimalDigits, maxDigitCount]);

  return (
    <div
      className={`${props.className ?? ''} flex h-[1lh] select-none flex-row-reverse overflow-clip leading-none`}
    >
      {props.suffix != null ? (
        <Character index={0}>
          <span>{props.suffix}</span>
        </Character>
      ) : null}

      {fractionDigits.length > 0 ? (
        <>
          {fractionDigits.map((digit, index) => {
            return <Digit key={index} index={index} shiftIndex={digit} />;
          })}

          <Character index={0}>
            <span>,</span>
          </Character>
        </>
      ) : null}

      {Array.from({ length: maxDigitCount }, (_value, i) => i).map((index) => (
        <Digit key={index} index={index} shiftIndex={decimalDigits[index] ?? ''} />
      ))}

      {props.prefix != null ? (
        <Character index={0}>
          <span>{props.prefix}</span>
        </Character>
      ) : null}
    </div>
  );
});
