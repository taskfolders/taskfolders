
export TASKFOLDERS_SHELL_LINKS=1
export TASKFOLDERS_SHELL_LINKS_EDITOR=mscode
export TASKFOLDERS_LOGGER_DEV=1
#export TASKFOLDERS_LOGGER_LINKS_LEVEL=info

npx vitest --run --exclude '**/*_noci*' --allowOnly=false
