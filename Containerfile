ARG BASE_IMAGE_NAME="${BASE_IMAGE_NAME:-base}"
ARG IMAGE_FLAVOR="${IMAGE_FLAVOR:-main}"
ARG SOURCE_IMAGE="${SOURCE_IMAGE:-$BASE_IMAGE_NAME-$IMAGE_FLAVOR}"
ARG BASE_IMAGE="ghcr.io/ublue-os/${SOURCE_IMAGE}"
ARG FEDORA_MAJOR_VERSION="${FEDORA_MAJOR_VERSION:-38}"

FROM ${BASE_IMAGE}:${FEDORA_MAJOR_VERSION} AS builder

COPY etc /etc
COPY usr /usr
#Remove read access to sudoers, now that it's copied
RUN chmod 440 /etc/sudoers

ARG IMAGE_NAME="${IMAGE_NAME}"
ARG FEDORA_MAJOR_VERSION="${FEDORA_MAJOR_VERSION}"

ADD packages.json /tmp/packages.json
ADD build.sh /tmp/build.sh

RUN /tmp/build.sh && \
    pip install --prefix=/usr yafti && \
    rm -rf /tmp/* /var/* && \
    systemctl enable docker && \
    systemctl enable lightdm && \
    systemctl enable ublue-lightdm-workaround && \
    systemctl enable touchegg && \
    ostree container commit && \
    mkdir -p /var/tmp && \
    chmod -R 1777 /var/tmp

#Get rid of system sounds
RUN rm /usr/share/cinnamon-control-center/sounds/*

#Need to copy this separately from when we copy over /usr
#because it gets overwitten when touchegg is installed.
COPY config/touchegg.conf /usr/share/touchegg

RUN ostree container commit
