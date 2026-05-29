import {
  Sword, Shield, Trophy, Flame, Gem, Crown,
  Gamepad2, Target, Star, Skull, Zap, Medal,
  Bird, Dog, Cat, Waves, Heart, CircleDot,
  Crosshair, Hexagon, Pentagon, Diamond, Sparkles, Rocket,
  Anchor, Flag, Mountain, Compass, Eye, Bolt,
} from 'lucide-react';

export const KIT_ICONS: { name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'sword', icon: Sword },
  { name: 'shield', icon: Shield },
  { name: 'trophy', icon: Trophy },
  { name: 'flame', icon: Flame },
  { name: 'gem', icon: Gem },
  { name: 'crown', icon: Crown },
  { name: 'gamepad', icon: Gamepad2 },
  { name: 'target', icon: Target },
  { name: 'star', icon: Star },
  { name: 'skull', icon: Skull },
  { name: 'zap', icon: Zap },
  { name: 'medal', icon: Medal },
  { name: 'bird', icon: Bird },
  { name: 'dog', icon: Dog },
  { name: 'cat', icon: Cat },
  { name: 'waves', icon: Waves },
  { name: 'heart', icon: Heart },
  { name: 'dot', icon: CircleDot },
  { name: 'crosshair', icon: Crosshair },
  { name: 'hexagon', icon: Hexagon },
  { name: 'pentagon', icon: Pentagon },
  { name: 'diamond', icon: Diamond },
  { name: 'sparkles', icon: Sparkles },
  { name: 'rocket', icon: Rocket },
  { name: 'anchor', icon: Anchor },
  { name: 'flag', icon: Flag },
  { name: 'mountain', icon: Mountain },
  { name: 'compass', icon: Compass },
  { name: 'eye', icon: Eye },
  { name: 'bolt', icon: Bolt },
];

const iconMap = new Map(KIT_ICONS.map(k => [k.name, k.icon]));

export function KitIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap.get(name);
  if (!Icon) return <span className={className}>{name}</span>;
  return <Icon className={className} />;
}
