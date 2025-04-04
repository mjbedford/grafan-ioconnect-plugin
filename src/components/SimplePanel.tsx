import React, { useEffect, useState } from 'react'; //useContext
import { PanelProps, DataHoverEvent, DataSelectEvent } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { PanelDataErrorView, RefreshEvent } from '@grafana/runtime';
import IOWorkspaces from '@interopio/workspaces-api';
import IOBrowser, { IOConnectBrowser } from '@interopio/browser';

interface Props extends PanelProps<SimpleOptions> {}

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
  const styles = useStyles2(getStyles);
  const [prevDataId, setPrevDataId] = useState('');
  const [ioVersion, setIoVersion] = useState('');

  const initializeIOConnect = async () => {
    // Initializing the Workspaces library.
    const initOptions = {
      libraries: [IOWorkspaces],
    };

    // Use the object returned from the factory function
    // to access the IOConnect Browser APIs.
    const io = await IOBrowser(initOptions);
    io && setIoVersion(io.version);
    return io; //as IOConnectBrowser.API;
  };
  useEffect(() => {
    const io = initializeIOConnect().catch(console.error);
  });

  const openWindow = async (io) => {
    io.windows.open('ClientList', 'http://localhost:8080/client-list');
  };
  useEffect(() => {
    const subscriber = eventBus.getStream(DataHoverEvent).subscribe((event) => {
      const payload = event.payload.dataId;
      if (prevDataId !== payload) {
        if (payload) {
          // console.log(`Received event:` + payload);
          openWindow(io);
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
        <div>
          <h2>Data</h2>
          <pre>{prevDataId}</pre>
        </div>
        <div className={styles.textBox}>
          {options.showSeriesCount && (
            <div data-testid="simple-panel-series-counter">Number of series: {data.series.length}</div>
          )}
        </div>
        <footer>io.Connect API version: {ioVersion}</footer>
      </div>
    </>
  );
};
