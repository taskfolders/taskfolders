# WHY ShellClient?

Convenience shell execution scripts

- dry run mode
- verbose mode for debugging

Needs
  when scripting
    when you use JS for scripting and run multiple shell commands, you might have a set of desired common defaults, like the base `cwd` or verbosity level.
    
  when testing
    expected that all shell commands are supposed to be mocked. A guard makes all commands fial

## Make common use cases explicit

Follow CQRS convention to keep state change from query 

.command()
  commands needed for their action, to produce content, change state
  no output to read from result

.query()
  commands you run just to query information
  no state change
  auto trim output (usually final new line character)

The master piece is .execute()
  the lower level abstraction for .command and .query
  can be used to trim long outputs