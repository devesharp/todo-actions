FROM node:12.6.0

LABEL "com.github.actions.name"="todo-actions"
LABEL "com.github.actions.description"="Convert TODO comments into tasks"
LABEL "com.github.actions.icon"="alert-circle"
LABEL "com.github.actions.color"="gray-dark"

LABEL "repository"=""
LABEL "homepage"=""
LABEL "maintainer"="devesharp <contato@devesharp.com>"

ENV GIT_COMMITTER_NAME=devesharp
ENV GIT_AUTHOR_NAME=devesharp
ENV EMAIL=devesharp[bot]@users.noreply.github.com

RUN mkdir -p /app
ADD entrypoint.sh package.json tsconfig.json yarn.lock /app/
RUN cd /app && yarn --frozen-lockfile
ADD src /app/src
RUN cd /app && yarn build
ENTRYPOINT ["/app/entrypoint.sh"]
