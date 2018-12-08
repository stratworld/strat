# The Lit System Language

Lit is a language to represent and deploy event based systems.

Development is in the extreme early stage -- use at your own risk.

A working example project can be found in examples/includes/Root.lit

# To Run

The examples require an "event library" called Http which will eventually be part of the standard library.  You'll need to pull [that library](https://github.com/CaptainCharlieGreen/litHttp) down as well into a directory next to this one.

Copy the litconfig.TEMPLATE.json file as "litconfig.json" and set the keys within.

Then
  $ npm install

Then (this is just for convenience -- you can also create a link from /usr/bin)
  $ chmod +x ./lit.js

Then
  $ ./lit.js build examples/includes/Root.lit

This has not been tested on Windows or MacOS.  It should work on Mac, and I'd be surprised if it worked on Windows.

