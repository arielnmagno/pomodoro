import { useCallback, useState } from "react";
import clsx from "clsx";
import Icon from "./Icon";
import Progress from "./Progress";
import Countdown from "./Countdown";
import classes from "./Timer.module.css";
import { useDispatch, useSelector } from "react-redux";
import { nextRound, setMode } from "../redux/timerSlice";
import { POMODORO, SHORT_BREAK } from "../constants";
import { updateFavicon } from "../helpers";

const SecondaryButton = ({ children, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        classes.secondaryButton,
        active && classes.secondaryActive
      )}
    >
      {children}
    </button>
  );
};

const PrimaryButton = ({ active, onClick, color }) => (
  <button
    onClick={onClick}
    className={clsx(
      classes.primaryButton,
      active && classes.primaryActive,
      color
    )}
  >
    {active ? "Stop" : "Start"}
  </button>
);

const SkipButton = ({ onClick, className }) => (
  <button onClick={onClick} className={clsx(classes.skipButton, className)}>
    <Icon name="skip_next" size={48} />
  </button>
);

export default function Timer() {
  const dispatch = useDispatch();
  const { mode, round, modes } = useSelector((state) => state.timer);
  const time = modes[mode].time * 60;
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setRunning] = useState(false);

  const toggleClock = useCallback(() => {
    setRunning((prev) => !prev);
  }, []);

  const stopRunning = useCallback(() => setRunning(false), []);

  const onRunning = useCallback((curr) => setCurrentTime(curr), []);

  const jumpTo = useCallback(
    (id) => {
      setRunning(false);
      dispatch(setMode(id));
      updateFavicon(id);
    },
    [dispatch]
  );

  const skip = useCallback(() => {
    setRunning(false);
    if (mode === POMODORO) {
      dispatch(setMode(SHORT_BREAK));
      dispatch(nextRound());
    } else {
      dispatch(setMode(POMODORO));
    }
    updateFavicon(mode);
  }, [dispatch, mode]);

  return (
    <div>
      <Progress percent={(currentTime / time) * 100} />
      <div className={classes.container}>
        <div className={classes.content}>
          <ul>
            {Object.values(modes).map(({ id, label }) => (
              <SecondaryButton
                key={id}
                active={id === mode}
                id={id}
                onClick={() => jumpTo(id)}
              >
                {label}
              </SecondaryButton>
            ))}
          </ul>
          <Countdown
            key={time}
            ticking={isRunning}
            from={time}
            onTimeout={stopRunning}
            onTick={onRunning}
          />
          <div className={classes.actionButtons}>
            <PrimaryButton
              active={isRunning}
              onClick={toggleClock}
              color={classes[mode]}
            />
            <div className={classes.skipAction}>
              <SkipButton
                className={isRunning && classes.showSkip}
                onClick={skip}
              />
            </div>
          </div>
        </div>
        <div className={classes.counter}>#{round}</div>
        <footer className={classes.footer}>
          {mode === POMODORO ? "Time to focus!" : "Time for a break!"}
        </footer>
      </div>
    </div>
  );
}
