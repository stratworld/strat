<!-- 

Distribute Everything
  We write our logic in small chunks that can execute anywhere, make no presumptions about system state, and accept and produce only serialized data.

Abstract Surface Area Code
  Surface area code is the code that connects chunks of business logic together.  Connecting to an external service, interop with the file system, connecting to a database, and receiving http requests are examples of Surface Area Code.  As our units of business logic get smaller and more numerous, the surface area between them increases dramatically.  Rather than drown in nuanced connection logic in every component, we choose to abstract Surface Area Code.

Attack DevOps
  We believe that except in extreme situations DevOps effort is waste.  We build and deploy applications in simple, conventional ways and let a compiler do the infrastructure provisioning and maintence for us.  Cloud infrastructure has become sophisticated enough to handle almost all production load scenarios--we don't think a "just make it work" attitude is unreasonable.

Portability from Development to Production
  In the DevOps dark ages we've lost a vital part of software development: code should run on a local computer as it does on production hardware.  While portability between cloud providers is important, but being able to predict production behavior based on development behavior is critical to building correct systems.

Be a Base Layer Technology
  Users should never have to peek behind the curtains and dig into Strat's behavior.  Strat must fully encapsulate cloud infrastructure so that future developers can move beyond the struggles of today.  We recognize this means compromising features--our bias will be towards making robust abstractions over including special features. -->