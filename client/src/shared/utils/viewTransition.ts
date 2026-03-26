type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => void;
};

export const runViewTransition = (action: () => void) => {
  if (typeof document === "undefined") {
    action();
    return;
  }

  const transitionDocument = document as ViewTransitionDocument;
  if (typeof transitionDocument.startViewTransition === "function") {
    transitionDocument.startViewTransition(action);
    return;
  }

  action();
};
