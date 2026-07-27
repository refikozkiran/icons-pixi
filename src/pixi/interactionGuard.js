// Bir ScrollArea içinde sürükleme (kaydırma) algılandığında, o dokunuş
// hareketi bitene kadar alttaki kartların/butonların "tap" olayını
// bastırmak için paylaşılan, modül kapsamlı basit bir bayrak.
// ScrollArea sürüklemeyi algıladığında active=true yapar; parmak kalktığında
// (pointerup/pointerupoutside) tekrar false'a döner. Kaydırılabilir liste
// içindeki tıklanabilir öğeler, kendi pointertap'lerinde bunu kontrol eder.
export const dragGuard = { active: false };
