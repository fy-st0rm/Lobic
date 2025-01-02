use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use axum::extract::ws::Message;

#[derive(Debug, Clone)]
pub struct UserPool {
	inner: Arc<Mutex<HashMap<String, broadcast::Sender<Message>>>>,
}

impl UserPool {
	pub fn new() -> UserPool {
		UserPool {
			inner: Arc::new(Mutex::new(HashMap::new())),
		}
	}

	pub fn get_ids(&self) -> Vec<String> {
		let inner = self.inner.lock().unwrap();
		inner.clone().into_keys().collect()
	}

	pub fn get_conns(&self) -> Vec<broadcast::Sender<Message>> {
		let inner = self.inner.lock().unwrap();
		inner.clone().into_values().collect()
	}

	pub fn get(&self, key: &str) -> Option<broadcast::Sender<Message>> {
		let inner = self.inner.lock().unwrap();
		inner.get(key).cloned()
	}

	pub fn exists(&self, key: &str) -> bool {
		let inner = self.inner.lock().unwrap();
		inner.contains_key(key)
	}

	pub fn insert(&self, id: &str, sender: &broadcast::Sender<Message>) {
		let mut inner = self.inner.lock().unwrap();
		inner.insert(id.to_string(), sender.clone());
	}
}
