set -ev

# default case
TASKFOLDERS_SHELL_LINKS=  TASKFOLDERS_LOGGER_DEV= bun logs.start.ts

# for developers
TASKFOLDERS_SHELL_LINKS=logs TASKFOLDERS_LOGGER_DEV=1 bun logs.start.ts

# filter by log level
LOG_LEVEL=warn bun logs.start.ts 

# show verbose but without links
TASKFOLDERS_SHELL_LINKS=logs LOG_LEVEL=trace bun logs.start.ts 
