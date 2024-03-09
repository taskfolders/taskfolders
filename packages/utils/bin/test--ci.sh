#!/bin/sh

export TASKFOLDERS_SHELL_LINKS=logs,screen
export TASKFOLDERS_SHELL_LINKS_EDITOR=mscode
export TASKFOLDERS_LOGGER_DEV=1
#export TASKFOLDERS_LOGGER_LINKS_LEVEL=info
export NODE_ENV=test

npx vitest --run --allowOnly=false \
  --testNamePattern '^((?!#ci-broken).)*$' $@

