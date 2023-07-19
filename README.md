# cinnamon

**This image is considered alpha**

[![release-please](https://github.com/ublue-os/cinnamon/actions/workflows/release-please.yml/badge.svg)](https://github.com/ublue-os/cinnamon/actions/workflows/release-please.yml)

![image](https://user-images.githubusercontent.com/1264109/236370188-cbbfa831-65b7-48ca-9c8c-d67c777b0f62.png)

To try this image, you can either download the iso or rebase over an existing Fedora Silverblue install.

<br>

## Download and install [the ISO from here](https://ublue.it/installation/)
Select "Install ublue-os/cinnamon" from the menu 
- Choose "Install cinnamon:38" if you have an AMD or Intel GPU
- Choose "Install cinnamon-nvidia:38" if you have an Nvidia GPU

<br>

## Rebase over Fedora Silverblue

    rpm-ostree rebase ostree-image-signed:docker://ghcr.io/ublue-os/cinnamon-main:38

or if you have an NVIDIA GPU:

    rpm-ostree rebase ostree-image-signed:docker://ghcr.io/ublue-os/cinnamon-nvidia:38

<br>

## Caveats

- Thanks to @jerbmega for the lightdm workaround!
