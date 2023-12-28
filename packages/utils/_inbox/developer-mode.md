tags: post, docs

In some utilities, it is very useful having a link to the source related to that utility:

- [logs](?)
- [issues](?)
- [screen](?)

However it is expensive to compute stack lines, so you must be very explicit enabling this

# How to enable?
Set NODE_ENV=development or TF_DEV=1
and make sure APP_RELEASE is not defined
