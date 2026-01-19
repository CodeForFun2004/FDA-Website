'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

// Format: The chart config is an object that contains the configuration for each data key
export interface ChartConfig {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  );
}

type ChartConfigKeys = keyof ChartConfig;

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
  id?: string;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-none",
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: [
          `[data-chart=${id}] {`,
          ...colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.light || itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }),
          `}`,
          `[data-chart=${id}][data-theme="dark"] {`,
          ...colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.dark || itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }),
          `}`
        ]
          .filter(Boolean)
          .join('\n')
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps
  extends React.ComponentProps<typeof RechartsPrimitive.Tooltip> {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: any;
  }>;
  label?: string;
  labelKey?: string;
  nameKey?: string;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  className?: string;
  color?: string;
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
  formatter?: (
    value: any,
    name: any,
    item: any,
    index: number,
    payload: any
  ) => React.ReactNode;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      labelKey,
      nameKey,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      className,
      color,
      labelFormatter,
      formatter
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || label}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className='font-medium'>{labelFormatter(label, payload)}</div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className='font-medium'>{value}</div>;
    }, [label, labelKey, payload, hideLabel, labelFormatter, config]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot';

    return (
      <div
        ref={ref}
        className={cn(
          'border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className='grid gap-1.5'>
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            const value = item.value;
            const name = itemConfig?.label || key;

            if (formatter && item.value !== undefined && item.name) {
              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
                    indicator === 'dot' && 'items-center'
                  )}
                >
                  {formatter(value, name, item, index, item.payload)}
                </div>
              );
            }

            return (
              <div
                key={item.dataKey}
                className={cn(
                  '[&>svg]:text-muted-foreground flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
                  indicator === 'dot' && 'items-center'
                )}
              >
                {indicator && (
                  <div
                    className={cn(
                      'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                      {
                        'w-2.5': indicator === 'dot',
                        'w-1 flex-1': indicator === 'line',
                        'w-0 border-l-2 border-dashed bg-transparent':
                          indicator === 'dashed',
                        'my-0.5': nestLabel && indicator === 'dashed'
                      }
                    )}
                    style={
                      {
                        '--color-bg': indicatorColor,
                        '--color-border': indicatorColor
                      } as React.CSSProperties
                    }
                  />
                )}
                <div
                  className={cn(
                    'flex flex-1 justify-between leading-none',
                    nestLabel ? 'items-end' : 'items-center'
                  )}
                >
                  <div className='grid gap-1.5'>
                    {nestLabel ? tooltipLabel : null}
                    <span className='text-muted-foreground'>{name}</span>
                  </div>
                  <div className='text-foreground font-mono font-medium tabular-nums'>
                    {value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    payload?: Array<{
      value: string;
      type: string;
      color: string;
      dataKey?: string;
    }>;
    nameKey?: string;
  }
>(({ className, payload, nameKey, ...props }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-center gap-4', className)}
      {...props}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className='[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3'
          >
            <div
              className='h-2 w-2 shrink-0 rounded-[2px]'
              style={{
                backgroundColor: item.color
              }}
            />
            <span className='text-muted-foreground text-sm'>
              {itemConfig?.label || item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = 'ChartLegendContent';

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle
};
