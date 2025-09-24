/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};

// Extensões para lucide-react
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }
  
  export type LucideIcon = FC<LucideProps>;
  
  export const Upload: LucideIcon;
  export const Video: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Zap: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Trophy: LucideIcon;
  export const Crown: LucideIcon;
  export const Medal: LucideIcon;
  export const Users: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Calendar: LucideIcon;
  export const Eye: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Clock: LucideIcon;
  export const Target: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const Home: LucideIcon;
  export const FileVideo: LucideIcon;
  export const Wallet: LucideIcon;
  export const User: LucideIcon;
  export const BarChart: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const LogOut: LucideIcon;
  export const Settings: LucideIcon;
}