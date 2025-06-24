declare module 'lucide-react-native' {
  import { ComponentType } from 'react';
  import { SvgProps } from 'react-native-svg';

  // Define the common props that all icon components accept
  interface IconProps extends SvgProps {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
  }

  // Define each icon as a React component that accepts IconProps
  export const TrendingUp: ComponentType<IconProps>;
  export const TrendingDown: ComponentType<IconProps>;
  export const RefreshCw: ComponentType<IconProps>;
  export const ArrowUp: ComponentType<IconProps>;
  export const ArrowDown: ComponentType<IconProps>;
  export const Minus: ComponentType<IconProps>;
  export const Package: ComponentType<IconProps>;
  export const ShoppingBag: ComponentType<IconProps>;
  export const Lock: ComponentType<IconProps>;
  export const Plus: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
  export const Bell: ComponentType<IconProps>;
  export const PenSquare: ComponentType<IconProps>;
  
  // Add any other icons you use from the library
}