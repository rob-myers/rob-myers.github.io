# Background

## Summary

_What's this site about?_

> __Answer__: Simulating human behaviour in a top-down 2D environment.

Call a simulated human an _actor_. Represent them by a circle with an arrow indicating the direction they face. An actor can _speak_, _have_ things, _hold_ things, and perform other actions dependent on inventory/position/direction/context. They're central to _Game AI_.


_So... you're providing a bunch of Game AI articles?_

> __Answer__: Not really.
>
> Technologically we provide:
> - an _interactive programming language_ (`bash` in the browser).
> - a _top-down level viewer_ (built using React, SVG and CSS).
>
> Each blog post provides levels and executable programs.
> - Behaviours are simulated by running programs in a level.
> - Users may run their own code.
> - Users may share ideas/code via comments (GitHub account required).

---

## The Language

_What is an interactive programming language?_

A programming language usually amounts to:

1. Rules for writing grammatically-correct text.
1. An algorithm interpreting such text as commands in a pre-existing programming language (e.g. assembly language).

_Interactivity_ means the program can be interpreted piecewise, like a conversation. Prominent amongst interactive languages are _shells_, used to manage Unix-like operating systems. They provide the oldest user interfaces in widespread use. Arguably the most popular shell is _bash_ (the default for Ubuntu and macOS).

_How can a shell run in a web browser?_

Bash is a programming language.

1. Its grammar has been defined in https://github.com/mvdan/sh, with a  Javascript port via [gopherjs](https://github.com/gopherjs/gopherjs). Given program text we obtain an _abstract syntax tree_.

1. These syntax trees can be inductively interpreted in Javascript via coroutines. Briefly, each node has an associated `AsyncIterableIterator` which can:

   - perform synchronous actions e.g. mount a file.
   - `await` asynchronous tasks e.g. for pipeline processes to terminate.
   - `yield` certain instructions e.g. _read from file descriptor_ and _write to file descriptor_.

Real shells depend heavily upon a filesystem and process/session management. Since these are unavailable in the browser, we implemented them in a simplified fashion. Notably we provide no process scheduler, instead relying upon the browser's scheduler and the user's diligence. A shell also requires a terminal interface, which we built using the excellent [xterm.js](https://github.com/xtermjs/xterm.js/).

_But __why__ have you implemented a shell in the browser?_

- A standard language...
- Better than behaviour trees...
- Better than Utility Functions...

_Surely this javascript shell doesn't perform very well..._

...
