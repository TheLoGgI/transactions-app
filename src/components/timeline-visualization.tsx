"use client"

import { useEffect, useRef, useState } from "react"

// interface DailyTransactionData {
//   date: string;
//   hasTransactions: boolean;
//   transactionCount: number;
// }

interface TimelineVisualizationProps {
  totalStart: Date;
  totalEnd: Date;
  selectedStart: Date;
  selectedEnd: Date;
}

// const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function TimelineVisualization({
  totalStart,
  totalEnd,
  selectedStart,
  selectedEnd,
}: TimelineVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(1000);

  // Fetch daily transaction data for the selected period
  // const urlQuery = `?from=${selectedStart.toISOString()}&to=${selectedEnd.toISOString()}`;
  // const { data: dailyData } = useSWR<DailyTransactionData[]>(`/api/transactions/daily${urlQuery}`, fetcher);

  // Update SVG width based on parent container
  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        const parentWidth = svgRef.current.parentElement?.clientWidth ?? 1000;
        setSvgWidth(parentWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate total duration in milliseconds
  const totalDuration = totalEnd.getTime() - totalStart.getTime();
  
  // Calculate positions (0-svgWidth scale)
  const selectedStartPos = ((selectedStart.getTime() - totalStart.getTime()) / totalDuration) * svgWidth;
  const selectedEndPos = ((selectedEnd.getTime() - totalStart.getTime()) / totalDuration) * svgWidth;
  
  // Ensure positions are within bounds
  const clampedStartPos = Math.max(0, Math.min(svgWidth, selectedStartPos));
  const clampedEndPos = Math.max(0, Math.min(svgWidth, selectedEndPos));

  // Calculate positions for missing data dots and group consecutive ones
  // const missingDataDots = dailyData?.filter(day => !day.hasTransactions).map(day => {
  //   const dayDate = new Date(day.date);
  //   const dayPos = ((dayDate.getTime() - totalStart.getTime()) / totalDuration) * svgWidth;
  //   return {
  //     x: Math.max(0, Math.min(svgWidth, dayPos)),
  //     date: day.date,
  //   };
  // }) ?? [];

  // Group consecutive missing days into segments
  // const missingDataSegments: Array<{ start: number; end: number; dates: string[] }> = [];
  
  // if (missingDataDots.length > 0) {
  //   const firstDot = missingDataDots[0];
  //   if (firstDot) {
  //     let currentSegment = { start: firstDot.x, end: firstDot.x, dates: [firstDot.date] };
      
  //     for (let i = 1; i < missingDataDots.length; i++) {
  //       const dot = missingDataDots[i];
  //       const prevDot = missingDataDots[i - 1];
        
  //       if (dot && prevDot) {
  //         // If dots are close (within 3 pixels), combine them into a segment
  //         if (Math.abs(dot.x - prevDot.x) <= 3) {
  //           currentSegment.end = dot.x;
  //           currentSegment.dates.push(dot.date);
  //         } else {
  //           // Start a new segment
  //           missingDataSegments.push(currentSegment);
  //           currentSegment = { start: dot.x, end: dot.x, dates: [dot.date] };
  //         }
  //       }
  //     }
      
  //     // Don't forget the last segment
  //     missingDataSegments.push(currentSegment);
  //   }
  // }

  return (
    <svg ref={svgRef} className="w-full" height="60" viewBox={`0 0 ${svgWidth} 60`}>
      {/* Total timeline background */}
      <rect 
        x="0" 
        y="25" 
        width={svgWidth} 
        height="10" 
        fill="currentColor" 
        className="text-gray-300 dark:text-gray-600" 
        rx="5" 
      />
      
      {/* Selected period highlight */}
      <rect 
        x={clampedStartPos} 
        y="25" 
        width={Math.max(2, clampedEndPos - clampedStartPos)} 
        height="10" 
        fill="currentColor"
        className="text-blue-500 dark:text-blue-400"
        rx="5" 
      />
      
      {/* Missing data segments (only within selected period) */}
      {/* {missingDataSegments.map((segment, index) => {
        // Only show segments within the selected period range
        if (segment.start >= clampedStartPos && segment.end <= clampedEndPos) {
          const segmentWidth = Math.max(2, segment.end - segment.start);
          const isSegment = segmentWidth > 2;
          
          if (isSegment) {
            // Render as a line for consecutive missing days
            return (
              <rect
                key={`missing-segment-${index}`}
                x={segment.start}
                y="29"
                width={segmentWidth}
                height="2"
                fill="currentColor"
                className="text-orange-500 dark:text-orange-400"
              >
                <title>{`Missing data: ${segment.dates.length} days (${new Date(segment.dates[0]!).toLocaleDateString("da-DK")} - ${new Date(segment.dates[segment.dates.length - 1]!).toLocaleDateString("da-DK")})`}</title>
              </rect>
            );
          } else {
            // Render as a single dot for isolated missing days
            return (
              <circle 
                key={`missing-dot-${index}`}
                cx={segment.start} 
                cy="30" 
                r="2" 
                fill="currentColor" 
                className="text-orange-500 dark:text-orange-400"
              >
                <title>{`Missing data: ${new Date(segment.dates[0]!).toLocaleDateString("da-DK")}`}</title>
              </circle>
            );
          }
        }
        return null;
      })} */}
      
      {/* Selected period markers */}
      {/* <circle cx={clampedStartPos} cy="30" r="3" fill="currentColor" className="text-blue-600 dark:text-blue-300" />
      <circle cx={clampedEndPos} cy="30" r="3" fill="currentColor" className="text-blue-600 dark:text-blue-300" /> */}
      
      {/* Labels */}
      <text x="0" y="50" fontSize="10" fill="currentColor" className="text-gray-600 dark:text-gray-400" textAnchor="start">
        {totalStart.toLocaleDateString("da-DK", { month: "short", year: "numeric" })}
      </text>
      <text x={svgWidth} y="50" fontSize="10" fill="currentColor" className="text-gray-600 dark:text-gray-400" textAnchor="end">
        {totalEnd.toLocaleDateString("da-DK", { month: "short", year: "numeric" })}
      </text>
      
      {/* Selected period labels */}
      {clampedStartPos > 50 && (
        <text x={clampedStartPos} y="15" fontSize="9" fill="currentColor" className="text-blue-600 dark:text-blue-300" textAnchor="middle">
          {selectedStart.toLocaleDateString("da-DK", { month: "short", day: "numeric" })}
        </text>
      )}
      {clampedEndPos < svgWidth - 50 && (
        <text x={clampedEndPos} y="15" fontSize="9" fill="currentColor" className="text-blue-600 dark:text-blue-300" textAnchor="middle">
          {selectedEnd.toLocaleDateString("da-DK", { month: "short", day: "numeric" })}
        </text>
      )}
    </svg>
  );
}
