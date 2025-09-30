/// <reference types="vite/client" />

// Declare minimal Neutralino global to satisfy TS checks when Neutralino runtime is present
declare global {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	var Neutralino: any;
    var PYTHON: any;
	var NL_OS: any;
}

export {}
