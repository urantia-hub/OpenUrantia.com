// components/Timeline.tsx

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

interface Event {
  date: string;
  title: string;
  description: string;
  prompt?: string;
  image_url?: string;
}

interface TimelineProps {
  events: Event[];
}

const Timeline = ({ events }: TimelineProps) => {
  return (
    <VerticalTimeline>
      {events.map((event, index) => (
        <VerticalTimelineElement key={index} date={event.date}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {event.title}
          </h3>
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.title}
              className="mt-4 rounded"
            />
          )}
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {event.description}
          </p>
        </VerticalTimelineElement>
      ))}
    </VerticalTimeline>
  );
};

export default Timeline;
