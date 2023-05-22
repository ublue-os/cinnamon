if test "$(id -u)" -gt "0" && test -d "$HOME"; then
    if test ! -e "$HOME"/.config/autostart/cinnamon-firstboot.desktop; then
        rsync -a /usr/share/ublue-os/firstboot/home/ "$HOME"/
        echo  '[ $GNOME_TERMINAL_SCREEN ] && open-workspace' >> ~/.bashrc 
        customize-cinnamon
    fi
fi