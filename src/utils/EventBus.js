
export default class EventBus {
    static getInstance() {
        return this._instance;
    }

    static _instance = new EventBus();
    eventCallbacksPairs = [];

    subscribe(eventType, callback) {
        const eventCallbacksPair = this.findEventCallbacksPair(eventType);

        if (eventCallbacksPair)
            eventCallbacksPair.callbacks.push(callback);
        else
            this.eventCallbacksPairs.push(EventBus.EventCallbacksPair(eventType, callback));
    }

    unsubscribe(eventType, callback) {
        const eventCallbacksPair = this.findEventCallbacksPair(eventType);
        if (eventCallbacksPair)
            eventCallbacksPair.callbacks = eventCallbacksPair.callbacks.filter(callbackInArr => callbackInArr !== callback);
    }

    post(eventType, args) {
        let eventCallbacksPair = this.findEventCallbacksPair(eventType);

        if (!eventCallbacksPair) {
            return;
        }

        if (eventCallbacksPair && eventCallbacksPair.callbacks)
            eventCallbacksPair.callbacks.forEach(callback => {
                if (callback) callback(args)
            });
    }

    findEventCallbacksPair(eventType) {
        return this.eventCallbacksPairs.find(eventObject => eventObject.eventType === eventType);
    }

    static EventCallbacksPair(eventType, callback) {
        let obj = {};
        obj.eventType = eventType;
        obj.callbacks = [callback];
        return obj;
    };
}

