# The Strat Cloud Language

Strat is a language to represent and deploy portable cloud systems.

Compile your system componets and .st files into system artifact (.sa) files.  Then, deploy those .sa files to any strat virtual substrate (SVS) implementation.  Strat does for cloud infrastructure what Java does for computers.

Currently supported SVS implementations:

  - AWS (using Lambda, APIGateway, S3, etc.)
  - Single computers
  - Azure (under development)

## Strat is infrastructure as high level code

Rather than specifying explicit infrastructure details like you would in Terraform, CloudFormation, or Serverless Framework, in Strat you declare an end state and Strat builds your system for you.  Those technologies call themselves "infrastructure as code"--really they're infrastructure as assembly, and Strat is infrastructure as high level code.

The Strat compiler is smart.  It can optimize your infrastructure to save on latency and hosting costs.  It builds roles and access control based on the same block scope you're used to in regular languages, and it can incorporate 3rd party services into your system as seemlessly as importing a library.

## Reclaim local development

While portability between cloud providers like AWS and Azure is valuable,
strat believes the most important portability story is that between developer machine and production hardware.  As such, strat ships with a local SVS implementation that works on consumer Linux, OSX, and Windows systems.

This means you can build a product locally then host it on the cloud with no code or behavior changes.


[Get started](https://lit.build/Guides/Getting%20Started)

[Documentation](https://lit.build/)
