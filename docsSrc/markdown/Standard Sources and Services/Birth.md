# Birth

After a Strat substrate hosts a sa file it dispatches a "Birth" event to each piece of infrastructure it created.  This is how custom sources and services can configure themselves after creation.  The Http source uses the Birth event to know what infrastructure to send Http requests to.  The actual contents of the Birth event change from substrate to substrate, and are meant to provide "implementation" information to sources and services.  Respones to Birth are output in the console that is running the substrate.

### staws Birth

Staws sends the following information to components on Birth:

```json
{
  "region": "a region string like us-west-2",
  "lambdas": [
    {
      "[host.name]": {
        "functionName": "the lambda function name for this host",
        "functionArn": "the lambda function arn for this host"
      }
    }
  ],
  "filename": "the absolute path of the .sa file executed"
}
```



