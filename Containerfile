ARG BASE_IMAGE_NAME="${BASE_IMAGE_NAME:-base}"
ARG IMAGE_FLAVOR="${IMAGE_FLAVOR:-main}"
ARG SOURCE_IMAGE="${SOURCE_IMAGE:-$BASE_IMAGE_NAME-$IMAGE_FLAVOR}"
ARG BASE_IMAGE="ghcr.io/ublue-os/${SOURCE_IMAGE}"
ARG FEDORA_MAJOR_VERSION="${FEDORA_MAJOR_VERSION:-38}"

FROM ${BASE_IMAGE}:${FEDORA_MAJOR_VERSION} AS builder

#COPY etc /etc
#RUN chmod +x /etc/ublue-lightdm-workaround.sh

ARG IMAGE_NAME="${IMAGE_NAME}"
ARG FEDORA_MAJOR_VERSION="${FEDORA_MAJOR_VERSION}"

ADD packages.json /tmp/packages.json
ADD build.sh /tmp/build.sh

RUN /tmp/build.sh && \
#    systemctl enable lightdm && \
#    systemctl enable ublue-lightdm-workaround && \
    rm -rf /tmp/* /var/* && \
    ostree container commit && \
    mkdir -p /var/tmp && \
    chmod -R 1777 /var/tmp

FROM fedora:38 as cinnamonList

RUN dnf group info \
        cinnamon-desktop \
    | awk '/^  /' \
    | xargs dnf group info -v  2>/dev/null \
    | awk '$2 == "fedora" || $2 == "updates" || $2 == "@System"{print $1}'  > /cinnamon.txt

FROM builder

COPY --from=cinnamonList /cinnamon.txt /tmp/cinnamon.txt

RUN xargs -a /tmp/cinnamon.txt rpm-ostree install
RUN ostree container commit
