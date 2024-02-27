# WHY

- shell logs with hyperlink back to the source
- dev level logs
- easy to disable logs in production
- light solution in Node and Browser runtimes
- freely log errors in code, but keep them out of test runs

# TODO env vars
shell hyperlinks can be expensive to calculate
  by default disabled
TF_SHELL_LINKS=$TF_SHELL_LINKS,logs

Dev logs should never be leaked to production
  must be manually enabled in the shell
  consider disabling the env variable if building for production
  TF_LOGGER_DEV=1

# ..
