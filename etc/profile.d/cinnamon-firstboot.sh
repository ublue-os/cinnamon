if test "$(id -u)" -gt "0" && test -d "$HOME"; then
    if test ! -e "$HOME"/.config/autostart/cinnamon-firstboot.desktop; then
        rsync -au /usr/share/ublue-os/firstboot/home/ "$HOME"/
    fi
fi