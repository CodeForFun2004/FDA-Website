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
  CardContent
} from './card';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from './table';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from './select';

// Loader Component (Custom)
export const LoadingState = () => (
  <div className='flex h-[200px] w-full items-center justify-center'>
    <Loader2 className='text-primary h-8 w-8 animate-spin' />
  </div>
);
