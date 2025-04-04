import React, { useEffect, useState,} from 'react'; //useContext 
import { PanelProps, DataHoverEvent, DataSelectEvent } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { PanelDataErrorView, RefreshEvent } from '@grafana/runtime';
//import { IOConnectContext } from '@interopio/react-hooks';
import { IOConnectDesktop } from '@interopio/desktop';
interface Props extends PanelProps<SimpleOptions> {}
declare global {
  interface Window {
    io: IOConnectDesktop.API;
    
  }
}
const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id, eventBus }) => {
  //const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const [prevDataId, setPrevDataId] = useState('');
  const [ioVersion, setIoVersion] = useState("");
  //const [context, setContext] = useState({});
  // Access the io.Connect APIs by using the `io` object
  // assigned as a value to `IOConnectContext` by the `<IOConnectProvider />` component.

  // const io = useContext(IOConnectContext);
  // window.io = io as IOConnectDesktop.API;

  useEffect(() => {
    (async () => {
     
      window.io && setIoVersion(window.io.version)
    })();
  }, []);

//   const openWindow = useIOConnect((io) => (name: string, url: string) => {
//     io.windows.open(name, url);
//   });
//  ;

  useEffect(() => {
    const subscriber = eventBus.getStream(DataHoverEvent).subscribe((event) => {
      //console.log(`Received event: ${event.type}`);
      const payload = event.payload.dataId;
      if (prevDataId !== payload) {
        if (payload) {
          // console.log(`Received event:` + payload);
          window.io.windows.open('ClientList', 'http://localhost:8080/client-list');
          //openWindow('ClientList', 'http://localhost:8080/client-list');
        }
      }
      if (payload !== undefined) {
        setPrevDataId(payload);
      }
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, prevDataId]);
  useEffect(() => {
    const subscriber = eventBus.getStream(RefreshEvent).subscribe((event) => {
      console.log(`Received event: ${event.type}`);
      console.log(`Received event: ${event.payload}`);
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);
  useEffect(() => {
    const subscriber = eventBus.getStream(DataSelectEvent).subscribe((event) => {
      console.log(`Received event: ${event.type}`);
      console.log(`Received event: ${event.payload}`);
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
    <>
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {/* <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
      >
        <g>
          <circle data-testid="simple-panel-circle" style={{ fill: theme.colors.primary.main }} r={100} />
        </g>
      </svg> */}

      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div data-testid="simple-panel-series-counter">Number of series: {data.series.length}</div>
        )}
        <div>{prevDataId}</div>
      </div> <footer>io.Connect API version: {ioVersion}</footer>
    </div>
   
    </>
  );
};
