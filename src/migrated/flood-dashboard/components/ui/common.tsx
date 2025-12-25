import React from 'react';
import { Loader2 } from 'lucide-react';

export { Button, type ButtonProps } from './button';
export { Input, type InputProps } from './input';
export { Badge, type BadgeProps } from './badge';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

// Loader Component (Custom)
export const LoadingState = () => (
  <div className="flex h-[200px] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
