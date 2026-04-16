'use client';

import { useThemeConfig } from '@/components/active-theme';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const DEFAULT_THEMES = [
  {
    name: 'Mặc định',
    value: 'blue'
  },
  {
    name: 'Xám',
    value: 'default'
  },
  {
    name: 'Xanh lá',
    value: 'green'
  },
  {
    name: 'Hổ phách',
    value: 'amber'
  }
];

const SCALED_THEMES = [
  {
    name: 'Mặc định',
    value: 'default-scaled'
  },
  {
    name: 'Xanh dương',
    value: 'blue-scaled'
  }
];

const MONO_THEMES = [
  {
    name: 'Đơn sắc',
    value: 'mono-scaled'
  }
];

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='theme-selector' className='sr-only'>
        Giao diện
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id='theme-selector'
          className='justify-start *:data-[slot=select-value]:w-12'
        >
          <span className='text-muted-foreground hidden sm:block'>
            Chọn giao diện:
          </span>
          <span className='text-muted-foreground block sm:hidden'>
            Giao diện
          </span>
          <SelectValue placeholder='Chọn giao diện' />
        </SelectTrigger>
        <SelectContent align='end'>
          <SelectGroup>
            <SelectLabel>Mặc định</SelectLabel>
            {DEFAULT_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Phóng to</SelectLabel>
            {SCALED_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Đơn cách</SelectLabel>
            {MONO_THEMES.map((theme) => (
              <SelectItem key={theme.name} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
